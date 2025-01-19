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
import { MultipartFile } from '@adonisjs/core/bodyparser'
import fs from 'fs/promises'
import { Exception } from '@adonisjs/core/exceptions'
import env from '#start/env'
import FileSaverProvider from '../providers/filesaver_provider.js'
import { ValidFileExtensions } from '../config/files_config.js'
import { strToCoordinates } from '../utils/parse.js'

@inject()
export default class AlertsController {
  constructor(
    private geocodingProvider: GeocodingProvider,
    private filesaverProvider: FileSaverProvider
  ) {}

  /**
   * @create
   * @requestBody <CreateAlertValidator>
   * @responseBody 200 - <AlertResponseValidator>
   */
  async create({ request, response }: HttpContext) {
    const payload = await request.validateUsing(CreateAlertValidator)

    const alert = await Alert.create({ name: payload.name })

    await alert.related('categories').attach(payload.categoriesId)
    await alert.load('categories')

    await alert.related('location').create({ description: `descrição do ${payload.name}` })
    await alert.load('location')

    if (typeof payload.location === 'string') {
      payload.location = strToCoordinates(payload.location)!
    }

    await alert.location.related('coord').create(payload.location)
    await alert.location.load('coord')

    const media: MultipartFile[] | null = request.files('media', {
      extnames: ValidFileExtensions.names,
      
    })

    const jsonALert = alert.toJSON()

    if (Array.isArray(media) && media.length > 0) {
      const savedMedia = await this.filesaverProvider.saveFiles(media)
      await alert.related('media').createMany(savedMedia)
      await alert.load('media')

      jsonALert.media = await this.filesaverProvider.getFilesFullUrl(savedMedia, {
        protocol: request.protocol(),
        hostname: request.hostname() ?? '',
      })
    }

    const validated = await AlertResponseValidator.validate({
      ...jsonALert,
      createdAt: alert.createdAt.toISODate(),
      updatedAt: alert.updatedAt.toISODate(),
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
          createdAt: alert.createdAt.toISODate(),
          updatedAt: alert.updatedAt.toISODate(),
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

    alert.location.description = await this.geocodingProvider.reverseGeocode(alert.location.coord)

    const validated = await AlertResponseValidator.validate({
      ...alert.toJSON(),
      createdAt: alert.createdAt.toISODate(),
      updatedAt: alert.updatedAt.toISODate(),
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
      createdAt: alert.createdAt.toISODate(),
      updatedAt: alert.updatedAt.toISODate(),
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

async function uploadMedia(media: MultipartFile[]): Promise<UploadedImage[]> {
  if (!media || media.length === 0) {
    return []
  }

  const uploadedImages = []

  for (const file of media) {
    // try {
    // Movendo o arquivo temporariamente para a pasta TMP (opcional para processar)
    const tempFilePath = file.tmpPath
    if (!tempFilePath) {
      //TODO: ver como fica esse erro
      throw new Error(
        `O caminho temporário do arquivo não está disponível para o arquivo ${file.clientName}`
      )
    }
    // Lendo o arquivo como base64
    const fileBuffer = await fs.readFile(tempFilePath)
    const base64Image = fileBuffer.toString('base64')

    // Fazendo upload para ImgBB
    const apiKey = env.get('IMGBB_API_KEY') // Substitua pela sua chave da API do ImgBB

    const responseImgBB = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      body: (() => {
        const formData = new FormData()
        formData.append('image', base64Image)
        return formData
      })(),
      method: 'POST',
    })

    const body = (await responseImgBB.json()) as ApiResponse

    if (responseImgBB.ok) {
      uploadedImages.push({
        fileName: file.clientName,
        imgbbUrl: body.data.url, // URL gerada pelo ImgBB
        deleteUrl: body.data.delete_url, // URL para deletar a imagem no futuro
      })
    } else {
      throw new Exception(responseImgBB.statusText)
    }
    // Adiciona o URL retornado à lista de imagens enviadas

    // Remove o arquivo temporário após o upload
    await fs.unlink(tempFilePath)
    // } catch (error) {
    //   throw new UploadImageException(file.clientName)
    // }
  }

  return uploadedImages
}

interface ImageData {
  id: string
  title: string
  url_viewer: string
  url: string
  display_url: string
  width: string
  height: string
  size: string
  time: string
  expiration: string
  image: {
    filename: string
    name: string
    mime: string
    extension: string
    url: string
  }
  thumb: {
    filename: string
    name: string
    mime: string
    extension: string
    url: string
  }
  medium: {
    filename: string
    name: string
    mime: string
    extension: string
    url: string
  }
  delete_url: string
}

interface ApiResponse {
  data: ImageData
  success: boolean
  status: number
}

interface UploadedImage {
  fileName: string
  imgbbUrl: string // URL gerada pelo ImgBB
  deleteUrl: string // URL para deletar a imagem no futuro
}
