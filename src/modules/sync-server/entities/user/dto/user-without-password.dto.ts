import { OmitType } from '@nestjs/swagger'

import { UserDTO } from './user.dto'


export class UserWithoutPasswordDTO extends OmitType(UserDTO, ['password']) {}
