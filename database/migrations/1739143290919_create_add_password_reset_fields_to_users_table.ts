import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users' // Mantendo o padrão, mas alterando a tabela correta

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('password_reset_token').nullable()
      table.timestamp('password_reset_token_expiration').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('password_reset_token')
      table.dropColumn('password_reset_token_expiration')
    })
  }
}
