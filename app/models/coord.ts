import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Coord extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare alert_location_id: number

  @column()
  declare latitude: number

  @column()
  declare longitude: number
}
