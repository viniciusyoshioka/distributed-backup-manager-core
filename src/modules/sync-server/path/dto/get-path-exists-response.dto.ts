import { IsBoolean } from 'class-validator'


export class GetPathExistsResponseDTO {
  @IsBoolean()
  exists!: boolean
}
