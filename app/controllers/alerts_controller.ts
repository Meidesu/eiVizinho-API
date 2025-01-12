import AlertNotFoundException from '#exceptions/alert_not_found_exception'
import Alert from '#models/alert'
import AlertCategory from '#models/alert_category'
import {
  AlertResponseValidator,
  CreateAlertValidator,
  UpdateAlertValidator,
} from '#validators/alert_validator'
import type { HttpContext } from '@adonisjs/core/http'
import GeocodingProvider from '../providers/geocoding_provider.js'
import { inject } from '@adonisjs/core'

@inject()
export default class AlertsController {
  constructor(private geocodingProvider: GeocodingProvider) {}

  /**
   * @create
   * @requestBody <CreateAlertValidator>
   * @responseBody 200 - <AlertResponseValidator>
   */
  async create({ request, response }: HttpContext) {
    const payload = await request.validateUsing(CreateAlertValidator)

    for (const id of payload.categoriesId) {
      try {
        await AlertCategory.findOrFail(id)
      } catch (err: any) {
        return response
          .status(400)
          .send({ error: `Categoria de alerta com id ${id} é inválida ou não existe` })
      }
    }

    const alert = await Alert.create({ name: payload.name })

    await alert.related('categories').attach(payload.categoriesId)
    await alert.load('categories')

    const location = await this.geocodingProvider.reverseGeocode(payload.location)

    await alert.related('location').create({ description: location })
    await alert.load('location')

    await alert.location.related('coord').create(payload.location)
    await alert.location.load('coord')

    const validated = await AlertResponseValidator.validate({
      ...alert.toJSON(),
      createdAt: alert.createdAt.toISO(),
      updatedAt: alert.updatedAt.toISO(),
    })

    return response.status(201).send(validated)
  }

  /**
   * @getAll
   * @responseBody 200 - <AlertResponseValidator[]>
   */
  async getAll({ response }: HttpContext) {
    const data = await Alert.query()
      .preload('categories')
      .preload('location', (query) => {
        query.preload('coord')
      })

    data.sort((a, b) => b.updatedAt.toJSDate().getTime() - a.updatedAt.toJSDate().getTime())

    const validatedData = await Promise.all(
      data.map(async (alert) => {
        return await AlertResponseValidator.validate({
          ...alert.toJSON(),
          createdAt: alert.createdAt.toISO(),
          updatedAt: alert.updatedAt.toISO(),
        })
      })
    )

    return response.status(200).send(validatedData)
  }

  /**
   *
   * @getById
   * @paramPath id - Id do alerta - @type(number) @required
   * @responseBody 200 - <AlertResponseValidator>
   */
  async getById({ params, response }: HttpContext) {
    const alert = await Alert.find(params.id)

    if (!alert) {
      throw new AlertNotFoundException(`Alerta com id ${params.id} não foi encontrado`)
    }

    await alert.load('categories')

    await alert.load('location', (query) => {
      query.preload('coord')
    })

    const validated = await AlertResponseValidator.validate({
      ...alert.toJSON(),
      createdAt: alert.createdAt.toISO(),
      updatedAt: alert.updatedAt.toISO(),
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
    const alert = await Alert.find(params.id)

    if (!alert) {
      throw new AlertNotFoundException(`Alerta com id ${params.id} não foi encontrado`)
    }

    const { name, categoriesId } = await request.validateUsing(UpdateAlertValidator)

    for (const id of categoriesId) {
      try {
        await AlertCategory.findOrFail(id)
      } catch (err: any) {
        return response
          .status(400)
          .send({ error: `Categoria de alerta com id ${id} é inválida ou não existe` })
      }
    }

    await alert.merge({ name }).save()

    await alert.related('categories').sync(categoriesId)

    await alert.load('categories')

    await alert.load('location', (query) => {
      query.preload('coord')
    })

    const validated = await AlertResponseValidator.validate({
      ...alert.toJSON(),
      createdAt: alert.createdAt.toISO(),
      updatedAt: alert.updatedAt.toISO(),
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

    await alert.delete()

    return response.status(200).json(alert)
  }
}
