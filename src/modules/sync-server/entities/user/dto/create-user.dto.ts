import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from 'class-validator'


export class CreateUserDTO {
  @IsString()
  @IsNotEmpty()
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
}
