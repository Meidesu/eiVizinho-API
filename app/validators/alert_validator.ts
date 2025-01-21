import vine from '@vinejs/vine'
import { AlertCategoryResponseValidator } from './alert_category_validator.js'
import { type MediaFileType } from '../config/files_config.js'

export const CreateAlertValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1),
    categoriesId: vine
      .array(vine.number().exists({ table: 'alert_categories', column: 'id' }))
      .notEmpty(),
    location: vine.unionOfTypes([
      vine.string().coordinates(),
      vine.object({
        latitude: vine.number(),
        longitude: vine.number(),
      }),
    ]),
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
    media: vine.array(
      vine.object({
        id: vine.number(),
        url: vine.string(),
        type: vine.enum(['audio', 'image', 'video'] as MediaFileType[]),
        createdAt: vine.string(),
        updatedAt: vine.string(),
      })
    ),
    createdAt: vine.date({ formats: { utc: false }  }),
    updatedAt: vine.date({ formats: { utc: false }  }),
  })
)

export const UpdateAlertValidator = vine.compile(
  vine.object({
    name: vine.string().trim().optional(),
    categoriesId: vine.array(vine.number().exists({ table: 'alert_categories', column: 'id' })).optional(),
    mediasId: vine.array(vine.number().exists({ table: 'files', column: 'id' })).optional()
  })
)
// id: 1,
// key: 'uploads/images/vsv0092zsutelk03w1zb8x9l.jpeg',
// type: 'image',
// alertId: 1,
// createdAt: '2025-01-20T05:23:35.092+00:00',
// updatedAt: '2025-01-20T05:23:35.092+00:00'
