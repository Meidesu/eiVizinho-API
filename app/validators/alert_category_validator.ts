import vine from '@vinejs/vine'

export const CreateAlertCategoryValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1),
    description: vine.string().trim().minLength(1),
    gravity: vine.number().range([0, 1]),
  })
)

export const AlertCategoryResponseValidator = vine.object({
  id: vine.number(),
  createdAt: vine.string(),
  updatedAt: vine.string(),
  name: vine.string().trim(),
  gravity: vine.number(),
  description: vine.string().trim(),
})
