import { IsEmail, IsStrongPassword } from 'class-validator'


export class UserCredentialsDTO {
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
