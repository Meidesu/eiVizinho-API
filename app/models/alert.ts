import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import AlertCategory from './alert_category.js'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'

export default class Alert extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @manyToMany(() => AlertCategory, {
    pivotTable: 'cat_alert',
  })
  declare categories: ManyToMany<typeof AlertCategory>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
