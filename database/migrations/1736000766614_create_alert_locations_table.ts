import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'alert_locations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('alert_id').unsigned().references('alerts.id').onDelete('CASCADE')
      table.string('description')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
