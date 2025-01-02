import vine from '@vinejs/vine'

const CreateAlertCategoryValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1),
    description: vine.string().trim().minLength(1),
    gravity: vine.number().range([0, 1]),
  })
)

export default CreateAlertCategoryValidator
