import vine from '@vinejs/vine'
import { FieldContext } from '@vinejs/vine/types'
import { DateTime } from 'luxon'

export const datetimeRule = vine.createRule((value: unknown, _, field: FieldContext) => {
  /**
   * We do not want to deal with non-string
   * values. The "string" rule will handle the
   * the validation.
   */
  if (typeof value !== 'string') {
    return
  }

  if (!DateTime.fromISO(value).isValid) {
    field.report("This datetime wasn't in ISO format!", 'datetime', field)
  }
})
