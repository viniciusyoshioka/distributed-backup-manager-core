import { IsDateString, IsEmail, IsString, IsUUID } from 'class-validator'


export class UserDTO {
  @IsUUID()
  id!: string

  @IsString()
  name!: string

  @IsEmail()
  email!: string

  @IsDateString()
  createdAt!: string

  @IsDateString()
  updatedAt!: string
}
