import vine from '@vinejs/vine'
import { AlertCategoryResponseValidator } from './alert_category_validator.js'

export const CreateAlertValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1),
    categoriesId: vine.array(vine.number()),
    location: vine.object({
      latitude: vine.number(),
      longitude: vine.number(),
    }),
  })
)

export const AlertResponseValidator = vine.compile(
  vine.object({
    id: vine.number(),
    name: vine.string().trim(),
    categories: vine.array(AlertCategoryResponseValidator),
    location: vine.object({
      description: vine.string().trim(),
      coord: vine.object({
        latitude: vine.number(),
        longitude: vine.number(),
      }),
    }),
    createdAt: vine.date({ formats: {} }),
    updatedAt: vine.date({ formats: {} }),
  })
)

export const UpdateAlertValidator = vine.compile(
  vine.object({
    name: vine.string().trim(),
    categoriesId: vine.array(vine.number()),
  })
)
