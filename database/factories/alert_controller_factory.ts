import factory from '@adonisjs/lucid/factories'
import AlertController from '#models/alert_controller'

export const AlertControllerFactory = factory
  .define(AlertController, async ({ faker }) => {
    return {}
  })
  .build()
