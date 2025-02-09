import { MultipartFile } from '@adonisjs/core/types/bodyparser'
import { MediaFileType, ValidFileExtensions } from '../config/files_config.js'
import { cuid } from '@adonisjs/core/helpers'
import { Exception } from '@adonisjs/core/exceptions'
import drive from '@adonisjs/drive/services/main'
import env from '#start/env'
import fs from 'node:fs/promises'

export interface SavedFile {
  key: string
  type: MediaFileType
}

type Options = {
  customDirectory?: string
}

export default class StorageProvider {
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

  async getFileUrl(
    key: string,
    options?: { protocol?: string; hostname?: string }
  ): Promise<string> {
    const driveDisk = env.get('DRIVE_DISK')
    let url = ''

    if (driveDisk === 'gcs') {
      url = await drive.use().getUrl(key)
    } else if (driveDisk === 'fs') {
      const port = env.get('PORT')

      let host = options?.hostname
      if (host === 'localhost' && port) host += `:${port}`

      url = `${options?.protocol}://${host}/media/${key}`
    }
    return url
  }
}

export async function uploadMedia(media: MultipartFile[]): Promise<UploadedImage[]> {
  if (!media || media.length === 0) {
    return []
  }

  const uploadedImages = []

  for (const file of media) {
    // try {
    // Movendo o arquivo temporariamente para a pasta TMP (opcional para processar)
    const tempFilePath = file.tmpPath
    if (!tempFilePath) {
      //TODO: ver como fica esse erro
      throw new Error(
        `O caminho temporário do arquivo não está disponível para o arquivo ${file.clientName}`
      )
    }
    // Lendo o arquivo como base64
    const fileBuffer = await fs.readFile(tempFilePath)
    const base64Image = fileBuffer.toString('base64')

    // Fazendo upload para ImgBB
    const apiKey = '' // env.get('IMGBB_API_KEY') -> Substitua pela sua chave da API do ImgBB

    const responseImgBB = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      body: (() => {
        const formData = new FormData()
        formData.append('image', base64Image)
        return formData
      })(),
      method: 'POST',
    })

    const body = (await responseImgBB.json()) as ApiResponse

    if (responseImgBB.ok) {
      uploadedImages.push({
        fileName: file.clientName,
        imgbbUrl: body.data.url, // URL gerada pelo ImgBB
        deleteUrl: body.data.delete_url, // URL para deletar a imagem no futuro
      })
    } else {
      throw new Exception(responseImgBB.statusText)
    }
    // Adiciona o URL retornado à lista de imagens enviadas

    // Remove o arquivo temporário após o upload
    await fs.unlink(tempFilePath)
    // } catch (error) {
    //   throw new UploadImageException(file.clientName)
    // }
  }

  return uploadedImages
}

interface ImageData {
  id: string
  title: string
  url_viewer: string
  url: string
  display_url: string
  width: string
  height: string
  size: string
  time: string
  expiration: string
  image: {
    filename: string
    name: string
    mime: string
    extension: string
    url: string
  }
  thumb: {
    filename: string
    name: string
    mime: string
    extension: string
    url: string
  }
  medium: {
    filename: string
    name: string
    mime: string
    extension: string
    url: string
  }
  delete_url: string
}

interface ApiResponse {
  data: ImageData
  success: boolean
  status: number
}

interface UploadedImage {
  fileName: string
  imgbbUrl: string // URL gerada pelo ImgBB
  deleteUrl: string // URL para deletar a imagem no futuro
}
