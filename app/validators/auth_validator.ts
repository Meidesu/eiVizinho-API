import vine from '@vinejs/vine'

export const LoginValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string().minLength(8).maxLength(32),
  })
)

export const RegisterValidator = vine.compile(
  vine.object({
    fullName: vine.string().minLength(2).maxLength(100),
    email : vine.string().email(),
    cpf:vine.string().minLength(11).maxLength(14).regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/),
    password: vine.string().minLength(8).maxLength(32).confirmed({confirmationField: "passwordConfirmation"}),
    //You should add passwordConfirmation on body!
  })
)
