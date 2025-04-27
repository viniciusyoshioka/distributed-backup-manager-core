import { HashType } from '../../hash'
import { GetFileHashDTO, PathParamDTO } from './dto'


export class PathMapper {
  static fromObjectToPathParamDto(query: object): PathParamDTO {
    const { path } = query as Record<string, string>

    const dto = new PathParamDTO()
    dto.path = path
    return dto
  }

  static fromObjectToGetFileHashDto(query: object): GetFileHashDTO {
    const { path, hashType } = query as Record<string, string>

    const dto = new GetFileHashDTO()
    dto.path = path
    dto.hashType = hashType as HashType
    return dto
  }
}
