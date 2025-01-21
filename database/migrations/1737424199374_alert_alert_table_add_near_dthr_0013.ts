import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'alerts'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('approximate_dt_hr').notNullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('approximate_dt_hr')
    })
  }
}
