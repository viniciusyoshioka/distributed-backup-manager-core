import { IsString } from 'class-validator'


export class GetPathExistsDTO {
  @IsString()
  path!: string
}
