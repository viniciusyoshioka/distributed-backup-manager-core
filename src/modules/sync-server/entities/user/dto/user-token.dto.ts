import { IsJWT } from 'class-validator'


export class UserTokenDTO {
  @IsJWT()
  token!: string
}
