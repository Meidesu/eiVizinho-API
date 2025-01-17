import vine from '@vinejs/vine'
import { cpfRule } from '../utils/cpf_rule.js'

const credentialIdentifier = vine.group([
  vine.group.if((data) => 'email' in data, {
    email: vine.string().email(),
  }),
  vine.group.if((data) => 'cpf' in data, {
    cpf: vine
      .string()
      .use(cpfRule())
      .transform((value) => value.replace(/\D/g, '')),
  }),
])

export const LoginRequestValidator = vine.compile(
  vine
    .object({
      password: vine.string().minLength(8).maxLength(32),
    })
    .merge(credentialIdentifier)
)

export const LoginResponseValidator = vine.compile(
  vine.object({
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
    token: vine.object({
      value: vine.string().startsWith('oat_'),
      expiresAt: vine.string(),
    }),
  })
)

export const RegisterRequestValidator = vine.compile(
  vine.object({
    fullName: vine.string().minLength(2).maxLength(100),
    email: vine.string().email(),
    cpf: vine
      .string()
      .use(cpfRule())
      .transform((value) => value.replace(/\D/g, '')),
    password: vine
      .string()
      .minLength(8)
      .maxLength(32)
      .confirmed({ confirmationField: 'passwordConfirmation' }),
    //You should add passwordConfirmation on body!
  })
)

export const RegisterResponseValidator = vine.compile(
  vine.object({
    id: vine.number(),
    fullName: vine.string().minLength(2).maxLength(100),
    email: vine.string().email(),
    cpf: vine
      .string()
      .use(cpfRule())
      .transform((value) => value.replace(/\D/g, '')),
    createdAt: vine.date({ formats: {} }),
    updatedAt: vine.date({ formats: {} }),
  })
)
