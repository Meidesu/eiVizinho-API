import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, hasOne, manyToMany } from '@adonisjs/lucid/orm'
import AlertCategory from './alert_category.js'
import type { HasMany, HasOne, ManyToMany } from '@adonisjs/lucid/types/relations'
import AlertLocation from './alert_location.js'
import File from './file.js'

export default class Alert extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @hasOne(() => AlertLocation, {
    foreignKey: 'alert_id',
  })
  declare location: HasOne<typeof AlertLocation>

  @manyToMany(() => AlertCategory, {
    pivotTable: 'cat_alert',
  })
  declare categories: ManyToMany<typeof AlertCategory>

  @column.dateTime()
  declare approximateDtHr: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => File, {
    foreignKey: 'alert_id',
    
  })
  declare media: HasMany<typeof File>
}
