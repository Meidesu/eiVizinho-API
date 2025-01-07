import { ruanValidator } from '#validators/ruan'
import type { HttpContext } from '@adonisjs/core/http'

export default class RuansController {
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
}
