import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'alert_categories'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.float('gravity').notNullable()
      table.string('description').notNullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('gravity')
      table.dropColumn('description')
    })
  }
}
