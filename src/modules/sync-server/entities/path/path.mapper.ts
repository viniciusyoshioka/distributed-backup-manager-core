import { HashType } from '../../../hash'
import { GetFileHashDTO, PathParamDTO } from './dto'


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
}
