import { IsDateString, IsEmail, IsString, IsStrongPassword, IsUUID } from 'class-validator'


export class UserDTO {
  @IsUUID()
  id!: string

  @IsString()
  name!: string

  @IsEmail()
  email!: string

  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password!: string

  @IsDateString()
  createdAt!: string

  @IsDateString()
  updatedAt!: string
}
