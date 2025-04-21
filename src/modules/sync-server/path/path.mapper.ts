import { GetPathExistsDTO, ResolvePathTypeDTO } from './dto'


export class PathMapper {
  static fromQueryObjectToGetPathExistsDto(query: object): GetPathExistsDTO {
    const { path } = query as Record<string, string>

    const dto = new GetPathExistsDTO()
    dto.path = path
    return dto
  }

  static fromQueryObjectToResolvePathTypeDto(query: object): ResolvePathTypeDTO {
    const { path } = query as Record<string, string>

    const dto = new ResolvePathTypeDTO()
    dto.path = path
    return dto
  }
}
