import { MediaFileType } from '../config/files_config.js'

export interface File {
  id: number
  key: string
  type: MediaFileType
  createdAt: string
  updatedAt: string
}
