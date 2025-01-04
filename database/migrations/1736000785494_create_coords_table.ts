import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'coords'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('alert_location_id')
        .unsigned()
        .references('alert_locations.id')
        .onDelete('CASCADE')
      table.float('latitude').notNullable()
      table.float('longitude').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
