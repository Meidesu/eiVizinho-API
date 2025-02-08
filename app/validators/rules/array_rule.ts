import vine from '@vinejs/vine'
import { FieldContext } from '@vinejs/vine/types'

export const arrayRule = vine.createRule((value: unknown, _, field: FieldContext) => {
  /**
   * We do not want to deal with non-string
   * values. The "string" rule will handle the
   * the validation.
   */
  if (typeof value !== 'string') {
    return
  }

  if (!isValidArray(value)) {
    field.report('The CPF is not valid!', 'cpf', field)
  }
})

export function isValidArray(value: string) {
  // Se não for string, o CPF é inválido
  if (typeof value !== 'string') {
    return false
  }

  let asArray: Array<any>

  try {
    asArray = JSON.parse(value)
  } catch (error) {
    return false
  }

  return Array.isArray(asArray)
}
