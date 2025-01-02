import AlertCategory from '#models/alert_category'
import CreateAlertCategoryValidator from '#validators/alert_category_validator'
import type { HttpContext } from '@adonisjs/core/http'

export default class AlertCategoriesController {
  /**
   *@getAll
   *@responseBody 200 - <AlertCategory[]>
   *
   */
  getAll({}: HttpContext) {
    const data = AlertCategory.all()

    return data
  }

  /**
   * @create
   * @requestBody  {"name": "string", "gravity": "float", "description": "string"}
   */
  async create({ request }: HttpContext) {
    const payload = await request.validateUsing(CreateAlertCategoryValidator)

    return AlertCategory.create(payload)
  }
}
