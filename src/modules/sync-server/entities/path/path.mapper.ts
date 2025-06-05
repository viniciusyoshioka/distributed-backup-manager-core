import { HashType } from '../../../hash/index.js'
import { GetFileHashDTO, MoveUploadedFileDTO, PathParamDTO } from './dto/index.js'


export class PathMapper {
  static fromObjectToPathParamDto(obj: object): PathParamDTO {
    const { path } = obj as Record<string, string>

    const dto = new PathParamDTO()
    dto.path = path
    return dto
  }

  static fromObjectToGetFileHashDto(obj: object): GetFileHashDTO {
    const { path, hashType } = obj as Record<string, string>

    const dto = new GetFileHashDTO()
    dto.path = path
    dto.hashType = hashType as HashType
    return dto
  }

  static fromObjectToMoveUploadedFileDto(obj: object): MoveUploadedFileDTO {
    const { uploadedFilePath, destinationPath } = obj as Record<string, string>

    const dto = new MoveUploadedFileDTO()
    dto.uploadedFilePath = uploadedFilePath
    dto.destinationPath = destinationPath
    return dto
  }
}
