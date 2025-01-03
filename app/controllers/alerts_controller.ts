import Alert from '#models/alert'
import AlertCategory from '#models/alert_category'
import { CreateAlertValidator, AlertResponseValidator } from '#validators/alert_validator'
import type { HttpContext } from '@adonisjs/core/http'

export default class AlertsController {
  /**
   * @create
   * @requestBody <CreateAlertValidator>
   * @responseBody 200 - <AlertResponseValidator>
   */
  async create({ request, response }: HttpContext) {
    const payload = await request.validateUsing(CreateAlertValidator)

    for (const id of payload.categories_id) {
      try {
        await AlertCategory.findOrFail(id)
      } catch (err: any) {
        return response
          .status(400)
          .send({ error: `Categoria de alerta com id ${id} é inválida ou não existe` })
      }
    }

    const alert = await Alert.create({ name: payload.name })

    await alert.related('categories').attach(payload.categories_id)

    await alert.load('categories')

    return response.status(201).send(alert)
  }

  /**
   * @getAll
   * @responseBody 200 - <AlertResponseValidator[]>
   */
  async getAll({ response }: HttpContext) {
    const data = await Alert.query().preload('categories')
    // const payload = await Promise.all(
    //   data.map(async (alert) => {
    //     const validatedData = await AlertResponseValidator.validate(alert)
    //     return { ...alert.toJSON(), ...validatedData }
    //   })
    // )

    return response.status(200).send(data)
  }
}
