import { IsString } from 'class-validator'


export class PathParamDTO {
  @IsString()
  path!: string
}
