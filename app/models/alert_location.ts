import { BaseModel, column, hasOne } from '@adonisjs/lucid/orm'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import Coord from './coord.js'

export default class AlertLocation extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare alert_id: number

  @hasOne(() => Coord, {
    foreignKey: 'alert_location_id',
  })
  declare coord: HasOne<typeof Coord>

  @column()
  declare description: string
}
