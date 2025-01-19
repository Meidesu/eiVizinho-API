import { BaseModel, column } from '@adonisjs/lucid/orm'
import { type FileType } from '../config/files_config.js'
import { DateTime } from 'luxon'

export default class File extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare key: string

  @column()
  declare type: FileType

  @column()
  declare alert_id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
