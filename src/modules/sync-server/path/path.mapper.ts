import { PathParamDTO } from './dto'


export class PathMapper {
  static fromObjectToPathParamDto(query: object): PathParamDTO {
    const { path } = query as Record<string, string>

    const dto = new PathParamDTO()
    dto.path = path
    return dto
  }
}
