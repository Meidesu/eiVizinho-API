/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number.optional(),
  HOST: Env.schema.string.optional({ format: 'host' }),
  LOG_LEVEL: Env.schema.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']),
  /*
  |----------------------------------------------------------
  | Variables for configuring database connection
  |----------------------------------------------------------
  */
  DB_HOST: Env.schema.string({ format: 'host' }),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string(),
  /*
 |----------------------------------------------------------
 | Variables for configuring app
 |----------------------------------------------------------
 */
  TOKEN_EXPIRATION_IN_SECONDS: Env.schema.number.optional(),
  TOKEN_EXPIRATION_IN_STRING: Env.schema.string.optional(),
  APP_KEY: Env.schema.string(),
  FILE_SIZE_LIMIT_IN_MB: Env.schema.string(),
  /*
  |----------------------------------------------------------
  | Variables for configuring the drive package
  |----------------------------------------------------------
  */
  DRIVE_DISK: Env.schema.enum(['gcs', 'fs'] as const),
  GCS_KEY_FILENAME: Env.schema.string(),
  GCS_BUCKET: Env.schema.string(),
  /*
  |----------------------------------------------------------
  | Variables for external APIs
  |----------------------------------------------------------
  */
  GOOGLE_MAPS_API_KEY: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring the mail package
  |----------------------------------------------------------
  */
  SMTP_HOST: Env.schema.string(),
  SMTP_PORT: Env.schema.string(),
  SMTP_USERNAME: Env.schema.string(),
  SMTP_PASSWORD: Env.schema.string(),
})
