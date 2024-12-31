import factory from '@adonisjs/lucid/factories'
import AlertCategory from '#models/alert_category'

export const AlertCategoryFactory = factory
  .define(AlertCategory, async ({ faker }) => {
    return {}
  })
  .build()
