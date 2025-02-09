import { ruanValidator } from '#validators/ruan'
import type { HttpContext } from '@adonisjs/core/http'
import StorageProvider from '../providers/storage_provider.js'
import { inject } from '@adonisjs/core'

@inject()
export default class RuansController {
  constructor(private storageProvider: StorageProvider) {}
  hello({ response }: HttpContext) {
    response.send({ msg: 'Olá ruan' })
  }

  /**
   * @postar
   * @description Post something
   * @responseBody 200 - <Alert[]>.with(relations)
   * @responseHeader 200 - X-pages - A description of the header - @example(test)
   */
  async postar({ request, response }: HttpContext) {
    const data = request.all()

    const payload = await ruanValidator.validate(data)

    response.send(payload)
  }

  async test({ request, response }: HttpContext) {
    const media = request.files('media')

    if (media) {
      return response.status(200).send(await this.storageProvider.saveFiles(media))
    }

    return response.status(400)
  }
}
