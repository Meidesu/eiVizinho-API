import vine from '@vinejs/vine'
import { cpfRule } from './cpf_rule.js'

export const UserValidator = vine.compile(
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
      value: vine.string().startsWith('oat_'), // Token 'oat_'
      expiresAt: vine.string(), 
    }),
  })
)

export const UpdateUserValidator = vine.compile(
  vine.object({
    fullName: vine.string().minLength(2).maxLength(100).optional(), 
    email: vine.string().email().optional(), 
    cpf: vine
      .string()
      .optional()
      .use(cpfRule()) 
      .transform((value) => value.replace(/\D/g, '')), 
  })
)
