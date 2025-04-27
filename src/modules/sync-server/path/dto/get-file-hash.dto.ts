import { IsEnum, IsString } from 'class-validator'

import { HashType } from '../../../hash'


export class GetFileHashDTO {
  @IsString()
  path!: string

  @IsEnum(HashType)
  hashType!: HashType
}
