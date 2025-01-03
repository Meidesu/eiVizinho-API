import vine from '@vinejs/vine'
import { AlertCategoryResponseValidator } from './alert_category_validator.js'

export const CreateAlertValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1),
    categories_id: vine.array(vine.number()),
  })
)

export const AlertResponseValidator = vine.compile(
  vine.object({
    id: vine.number(),
    name: vine.string().trim(),
    categories: vine.array(AlertCategoryResponseValidator),
  })
)
