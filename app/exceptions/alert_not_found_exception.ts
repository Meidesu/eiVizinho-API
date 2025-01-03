import { Exception } from '@adonisjs/core/exceptions'

export default class AlertNotFoundException extends Exception {
  static status = 404
  constructor(message: string = 'Alerta não encontrado.') {
    super(message)
  }
}
