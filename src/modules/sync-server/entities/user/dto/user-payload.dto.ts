import { IsEmail, IsNotEmpty, IsString, IsUUID } from 'class-validator'


export class UserPayloadDTO {
  @IsUUID()
  id!: string

  @IsString()
  @IsNotEmpty()
  name!: string

  @IsEmail()
  email!: string
}
