import { IsString } from 'class-validator'


export class ResolvePathTypeDTO {
  @IsString()
  path!: string
}
