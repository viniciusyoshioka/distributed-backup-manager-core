import { IsDateString, IsEmail, IsString, IsStrongPassword, IsUUID } from 'class-validator'


export class UserDTO {
  @IsUUID()
  id!: string

  @IsString()
  name!: string

  @IsEmail()
  email!: string

  @IsStrongPassword()
  password!: string

  @IsDateString()
  createdAt!: string

  @IsDateString()
  updatedAt!: string
}
