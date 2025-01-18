import { MultipartFile } from '@adonisjs/core/types/bodyparser'
import { FileType, ValidFileExtensions } from '../lib/files_config.js'
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

    console.log(files)

    for (const file of files) {
      const type = ValidFileExtensions.getFileType(file.extname ?? '')

      if (type === null) {
        throw new Exception(
          `File ${file.clientName} uploaded wasn't on valid format! Valid extensions are  ['jpg', 'png', 'jpeg','mp4','mkv']`,
          { code: '400' }
        )
      }

      const key = `uploads/${customDirectory}${type}s/${cuid()}.${file.extname}`
      console.log('ok')
      await file.moveToDisk(key)

      savedFiles.push({
        type,
        key,
      })
    }
    return savedFiles
  }

  async getFilesFullUrl(files: SavedFile[]) {
    if (!Array.isArray(files)) {
      throw new Exception(
        `FileSaverProvider:getFilesFullUrl received a non array to param files!`,
        { code: '500' }
      )
    }
    
    for (const file of files) {
      const driveDisk = env.get('DRIVE_DISK')
      switch(driveDisk){
        case 'fs':
          file.key = `http://localhost:3333/uploads/${file.key}`
          break
        case 'gcs':
          file.key = await drive.use().getUrl(file.key)
          break
      }
    }
    return files
  }
}
