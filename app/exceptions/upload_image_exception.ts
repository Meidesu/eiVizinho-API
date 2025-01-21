import { Exception } from '@adonisjs/core/exceptions'

export default class UploadImageException extends Exception {
  static status = 500
  constructor(fileName: string) {
    super(`Erro ao fazer upload para ImgBB: ${fileName}`)
  }
}
