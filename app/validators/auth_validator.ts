import vine from '@vinejs/vine'

export const LoginValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string().minLength(8).maxLength(32),
  })
)

export const RegisterValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(2).maxLength(100),
    username: vine.string().minLength(3).maxLength(15),
    password: vine.string().minLength(8).maxLength(32),
    confirm_password: vine.string().minLength(8).maxLength(32),
  })
)
