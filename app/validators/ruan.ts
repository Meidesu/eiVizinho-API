import vine from '@vinejs/vine'

export const ruanValidator = vine.compile(
  vine.object({
    name: vine.string().trim(),
  })
)
