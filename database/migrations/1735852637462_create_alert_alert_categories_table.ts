import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'cat_alert'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('alert_id').unsigned().references('alerts.id')
      table.integer('alert_category_id').unsigned().references('alert_categories.id')
      table.unique(['alert_id', 'alert_category_id'])

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
