import AlertNotFoundException from '#exceptions/alert_not_found_exception'
import Alert from '#models/alert'
import {
  AlertResponseValidator,
  CreateAlertValidator,
  UpdateAlertValidator,
} from '#validators/alert_validator'
import type { HttpContext } from '@adonisjs/core/http'
import GeocodingProvider from '../providers/geocoding_provider.js'
import { inject } from '@adonisjs/core'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import StorageProvider from '../providers/storage_provider.js'
import { ValidFileExtensions } from '../config/files_config.js'
import { strToCoordinates } from '../utils/parse.js'
import drive from '@adonisjs/drive/services/main'
import { File as FileInterface } from './../interfaces/file_dto.js'
import env from '#start/env'
import { DateTime } from 'luxon'
import transmit from '@adonisjs/transmit/services/main'
import AlertCategory from '#models/alert_category'
import User from '#models/user'

@inject()
export default class AlertsController {
  constructor(
    private geocodingProvider: GeocodingProvider,
    private storageProvider: StorageProvider
  ) {}

  /**
   * @create
   * @requestBody <CreateAlertValidator>
   * @responseBody 200 - <AlertResponseValidator>
   */
  async create({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(CreateAlertValidator)

    const user = auth.getUserOrFail()

    for (const categoryId of payload.categoriesId) {
      await AlertCategory.findOrFail(categoryId)
    }

    const alert = await user
      .related('alerts')
      .create({ name: payload.name, approximateDtHr: DateTime.fromISO(payload.approximateDtHr) })

    await alert.related('categories').attach(payload.categoriesId)
    await alert.load('categories')

    if (typeof payload.location === 'string') {
      payload.location = strToCoordinates(payload.location)!
    }

    const locationDescription = await this.geocodingProvider.reverseGeocode(payload.location)
    await alert.related('location').create({ description: locationDescription })
    await alert.load('location')

    await alert.location.related('coord').create(payload.location)
    await alert.location.load('coord')

    const media: MultipartFile[] | null = request.files('media', {
      extnames: ValidFileExtensions.names,
      size: env.get('FILE_SIZE_LIMIT_IN_MB'),
    })

    if (Array.isArray(media) && media.length > 0) {
      const savedMedia = await this.storageProvider.saveFiles(media)
      await alert.related('media').createMany(savedMedia)
      await alert.load('media')
    }

    const jsonAlert = alert.toJSON()

    if ((jsonAlert?.media as FileInterface[])?.length > 0) {
      for (const file of jsonAlert.media) {
        file.url = await this.storageProvider.getFileUrl(file.key, {
          protocol: request.protocol(),
          hostname: request.hostname() ?? '',
        })
      }
    } else {
      jsonAlert.media = []
    }

    const validated = await AlertResponseValidator.validate({
      ...jsonAlert,
      user: user.toJSON(),
      // createdAt: alert.createdAt.toISODate(),
      // updatedAt: alert.updatedAt.toISODate(),
    })

    transmit.broadcast('alerts', {
      name: alert.name,
      date: alert.createdAt.toISODate(),
      category: alert.categories[0].name,
    })

    return response.status(201).send(validated)
  }

  /**
   * @getAll
   * @responseBody 200 - <AlertResponseValidator[]>
   */
  async getAll({ request, response }: HttpContext) {
    const data = await Alert.query()
      .preload('categories')
      .preload('media')
      .preload('location', (query) => {
        query.preload('coord')
      })

    data.sort((a, b) => b.updatedAt.toJSDate().getTime() - a.updatedAt.toJSDate().getTime())

    const validatedData = await Promise.all(
      data.map(async (alert) => {
        const jsonAlert = alert.toJSON()
        if ((jsonAlert?.media as FileInterface[])?.length > 0) {
          for (const file of jsonAlert.media) {
            file.url = await this.storageProvider.getFileUrl(file.key, {
              protocol: request.protocol(),
              hostname: request.hostname() ?? '',
            })
          }
        }

        const user = await User.findOrFail(alert.userId)
        jsonAlert.user = user.toJSON()

        return await AlertResponseValidator.validate({
          ...jsonAlert,
          // createdAt: alert.createdAt.toISODate(),
          // updatedAt: alert.updatedAt.toISODate(),
        })
      })
    )

    transmit.broadcast('alerts', {
      message: 'Novo usuário cadastrado!',
      user: { name: 'Alice', email: 'alice@email.com' },
    })

    return response.status(200).send(validatedData)
  }

  /**
   *
   * @getById
   * @paramPath id - Id do alerta - @type(number) @required
   * @responseBody 200 - <AlertResponseValidator>
   */
  async getById({ params, request, response }: HttpContext) {
    const alert = await Alert.findOrFail(params.id)

    await alert.load('categories')
    await alert.load('media')
    await alert.load('location', (query) => {
      query.preload('coord')
    })

    alert.location.description = await this.geocodingProvider.reverseGeocode(alert.location.coord)

    const jsonAlert = alert.toJSON()

    if ((jsonAlert?.media as FileInterface[])?.length > 0) {
      for (const file of jsonAlert.media) {
        file.url = await this.storageProvider.getFileUrl(file.key, {
          protocol: request.protocol(),
          hostname: request.hostname() ?? '',
        })
      }
    }

    const validated = await AlertResponseValidator.validate({
      ...jsonAlert,
      // createdAt: alert.createdAt.toISODate(),
      // updatedAt: alert.updatedAt.toISODate(),
    })

    return response.status(200).json(validated)
  }

  /**
   *
   * @update
   * @paramPath id - Id do alerta - @type(number) @required
   * @requestBody <UpdateAlertValidator>
   * @responseBody 200 - <AlertResponseValidator>
   */
  async update({ params, request, response }: HttpContext) {
    const { name, categoriesId, mediasId } = await request.validateUsing(UpdateAlertValidator)

    const alert = await Alert.findOrFail(params.id)

    if (mediasId) {
      const dbMedia = await alert.related('media').query()
      // const media = await alert.related('media').query().delete().whereNotIn("id", mediasId)

      for (const file of dbMedia) {
        if (!mediasId.includes(file.id)) {
          await drive.use().delete(file.key)
        }
      }
      await alert.related('media').query().delete().whereNotIn('id', mediasId)
    }

    if (categoriesId) {
      await alert.related('categories').sync(categoriesId)
    }

    if (name) {
      await alert.merge({ name }).save()
    }

    await alert.load('categories')
    await alert.load('location', (query) => {
      query.preload('coord')
    })

    const reqMedia: MultipartFile[] | null = request.files('media', {
      extnames: ValidFileExtensions.names,
      size: env.get('FILE_SIZE_LIMIT_IN_MB'),
    })

    if (Array.isArray(reqMedia) && reqMedia.length > 0) {
      const savedMedia = await this.storageProvider.saveFiles(reqMedia)
      await alert.related('media').createMany(savedMedia)
    }
    await alert.load('media')

    const jsonAlert = alert.toJSON()

    if ((jsonAlert?.media as FileInterface[])?.length > 0) {
      for (const file of jsonAlert.media) {
        file.url = await this.storageProvider.getFileUrl(file.key, {
          protocol: request.protocol(),
          hostname: request.hostname() ?? '',
        })
      }
    }

    const validated = await AlertResponseValidator.validate({
      ...jsonAlert,
      // createdAt: alert.createdAt.toISODate(),
      // updatedAt: alert.updatedAt.toISODate(),
    })

    return response.status(200).json(validated)
  }

  /**
   *
   * @delete
   * @paramPath id - Id do alerta - @type(number) @required
   * @responseBody 200 - <AlertResponseValidator>
   */
  async delete({ params, response }: HttpContext) {
    const alert = await Alert.query()
      .where('id', params.id)
      .preload('categories')
      .preload('location', (query) => {
        query.preload('coord')
      })
      .first()

    if (!alert) {
      throw new AlertNotFoundException(`Alerta com id ${params.id} não foi encontrado`)
    }

    await alert.related('categories').detach()
    await alert.related('location').query().delete()

    const media = await alert.related('media').query()

    for (const file of media) {
      await drive.use().delete(file.key)
    }

    await alert.related('media').query().delete()
    await alert.delete()

    return response.status(200).json(alert)
  }
}
