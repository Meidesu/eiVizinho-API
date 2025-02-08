import env from '#start/env'
import { defineConfig, services } from '@adonisjs/drive'
import app from '@adonisjs/core/services/app'

const driveConfig = defineConfig({
  default: env.get('DRIVE_DISK'),

  /**
   * The services object can be used to configure multiple file system
   * services each using the same or a different driver.
   */
  services: {
    fs: services.fs({
      location: app.makePath('storage'),
      serveFiles: true,
      routeBasePath: '/media',
      visibility: 'public',
    }),

    gcs: services.gcs({
      keyFilename: env.get('GCS_KEY_FILENAME'),
      bucket: env.get('GCS_BUCKET'),
      visibility: 'public',
      usingUniformAcl: true
    }),
  },
})

export default driveConfig

declare module '@adonisjs/drive/types' {
  export interface DriveDisks extends InferDriveDisks<typeof driveConfig> {}
}
