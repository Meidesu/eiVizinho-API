import { BaseSchema } from '@adonisjs/lucid/schema'
import { FileType } from '../../app/config/files_config.js'

export default class extends BaseSchema {
  protected tableName = 'files'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string("key").notNullable()
      table.enum("type",["audio", "image", "video"] as FileType[]).notNullable()
      table.integer('alert_id').unsigned().references('alerts.id').onDelete('CASCADE').notNullable() // delete post when user is deleted
      table.timestamp('created_at', ).notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}