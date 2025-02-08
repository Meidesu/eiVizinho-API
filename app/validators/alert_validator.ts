import vine from '@vinejs/vine'
import { AlertCategoryResponseValidator } from './alert_category_validator.js'
import { type MediaFileType } from '../config/files_config.js'
import { datetimeRule } from './rules/datetime_rule.js'
import { arrayRule } from './rules/array_rule.js'
import { cpfRule } from '#validators/rules/cpf_rule'

export const CreateAlertValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1),
    approximateDtHr: vine.string().use(datetimeRule()),

    categoriesId:
      // vine.array(vine.number().exists({ table: 'alert_categories', column: 'id' })).notEmpty(),
      vine
        .string()
        .trim()
        .use(arrayRule())
        .transform((value) => JSON.parse(value) as Array<number>),

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
    approximateDtHr: vine.string().use(datetimeRule()),

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
    createdAt: vine.string(), //TODO: Change to date() like Meireles was doing. I changed to string to standardize the dates along the app
    updatedAt: vine.string(),
    user: vine.object({
      id: vine.number(),
      fullName: vine.string().minLength(2).maxLength(100),
      email: vine.string().email(),
      cpf: vine
        .string()
        .use(cpfRule())
        .transform((value) => value.replace(/\D/g, '')),
      createdAt: vine.date({ formats: {} }),
      updatedAt: vine.date({ formats: {} }),
    }),
  })
)

export const UpdateAlertValidator = vine.compile(
  vine.object({
    name: vine.string().trim().optional(),
    categoriesId: vine
      .array(vine.number().exists({ table: 'alert_categories', column: 'id' }))
      .optional(),
    mediasId: vine.array(vine.number().exists({ table: 'files', column: 'id' })).optional(),
  })
)
