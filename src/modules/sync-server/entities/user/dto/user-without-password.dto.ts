import { OmitType } from '@nestjs/swagger'

import { UserDTO } from './user.dto.js'


export class UserWithoutPasswordDTO extends OmitType(UserDTO, ['password']) {}
