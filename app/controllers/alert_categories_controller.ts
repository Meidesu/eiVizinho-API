import AlertCategory from '#models/alert_category'
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

  //   /**
  //    * @create
  //    * @requestBody  {"name": "string"}
  //    */
  //   create({ request }: HttpContext) {
  //     const data = request.all()

  //     console.log(data)

  //     return AlertCategory.create(data)
  //   }
}
