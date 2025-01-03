import AlertNotFoundException from '#exceptions/alert_not_found_exception'
import Alert from '#models/alert'
import AlertCategory from '#models/alert_category'
import { CreateAlertValidator, UpdateAlertValidator } from '#validators/alert_validator'
import type { HttpContext } from '@adonisjs/core/http'

export default class AlertsController {
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

    return response.status(201).send(alert)
  }

  /**
   * @getAll
   * @responseBody 200 - <AlertResponseValidator[]>
   */
  async getAll({ response }: HttpContext) {
    const data = await Alert.query().preload('categories')

    data.sort((a, b) => b.updatedAt.toJSDate().getTime() - a.updatedAt.toJSDate().getTime())

    return response.status(200).send(data)
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

    return response.status(200).json(alert)
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

    return response.status(200).json(alert)
  }

  /**
   *
   * @delete
   * @paramPath id - Id do alerta - @type(number) @required
   * @responseBody 200 - <AlertResponseValidator>
   */
  async delete({ params, response }: HttpContext) {
    const alert = await Alert.find(params.id)

    if (!alert) {
      throw new AlertNotFoundException(`Alerta com id ${params.id} não foi encontrado`)
    }

    alert.load('categories')

    await alert.delete()

    return response.status(200).json(alert)
  }
}
