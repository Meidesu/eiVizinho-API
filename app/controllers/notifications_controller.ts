import { HttpContext } from '@adonisjs/core/http'
import transmit from '@adonisjs/transmit/services/main'

/**
 * @get
 */
export default class NotificationsController {
  public async get({ response }: HttpContext) {
    // transmit.broadcast('notification/ola', {
    //   title: 'Hello World',
    //   description: 'This is a test notification',
    //   date: new Date().toISOString(),
    // })

    transmit.broadcast('notification/ola', {
      name: 'Mataram',
      date: new Date().toISOString(),
      category: 'Assalto',
    })

    return response.json({ message: 'Hello World' })
  }
}
