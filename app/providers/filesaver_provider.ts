import { MultipartFile } from '@adonisjs/core/types/bodyparser'
import { FileType, ValidFileExtensions } from '../config/files_config.js'
import { cuid } from '@adonisjs/core/helpers'
import { Exception } from '@adonisjs/core/exceptions'
import drive from '@adonisjs/drive/services/main'
import path from 'path'
import env from '#start/env'

export interface SavedFile {
  key: string
  type: FileType
}

type Options = {
  customDirectory?: string
}

export default class FileSaverProvider {
  async saveFiles(files: MultipartFile[], options?: Options): Promise<SavedFile[]> {
    if (!Array.isArray(files)) {
      throw new Exception(`FileSaverProvider:saveFiles received a non array to param files!`, {
        code: '500',
      })
    }

    const savedFiles: SavedFile[] = []
    const customDirectory = options?.customDirectory ? options?.customDirectory + '/' : ''

    for (const file of files) {
      const type = ValidFileExtensions.getFileType(file.extname ?? '')

      if (type === null) {
        throw new Exception(
          `File ${file.clientName} uploaded wasn't on valid format! Valid extensions are  ['jpg', 'png', 'jpeg','mp4','mkv']`,
          { code: '400' }
        )
      }

      const key = `uploads/${customDirectory}${type}s/${cuid()}.${file.extname}`
      await file.moveToDisk(key)

      savedFiles.push({
        type,
        key,
      })
    }
    return savedFiles
  }

  async getFilesFullUrl(files: SavedFile[], options?: { protocol?: string; hostname?: string }) {
    if (!Array.isArray(files)) {
      throw new Exception(
        `FileSaverProvider:getFilesFullUrl received a non array to param files!`,
        { code: '500' }
      )
    }

    for (const file of files) {
      const driveDisk = env.get('DRIVE_DISK')

      const port = env.get('PORT')

      let host = options?.hostname
      if (host === 'localhost' && port) {
        host += `:${port}`
      }

      switch (driveDisk) {
        case 'fs':
          file.key = `${options?.protocol}://${host}/media/${file.key}`
          break
        case 'gcs':
          //On this for-loop, just the line over is needed if you don't pretend to use fs as disk driver
          file.key = await drive.use().getUrl(file.key)
          break
      }
    }
    return files
  }
}
