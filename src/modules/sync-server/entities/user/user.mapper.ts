import { CreateUserDTO, UserDTO } from './dto'
import { UserEntity } from './user.entity'


export class UserMapper {
  static fromObjectToCreateUserDto(obj: object): CreateUserDTO {
    const { name, email, password } = obj as Record<string, string>

    const dto = new CreateUserDTO()
    dto.name = name
    dto.email = email
    dto.password = password
    return dto
  }

  static fromEntityToDto(entity: UserEntity): UserDTO {
    const dto = new UserDTO()
    dto.id = entity.id
    dto.name = entity.name
    dto.email = entity.email
    dto.createdAt = entity.createdAt
    dto.updatedAt = entity.updatedAt
    return dto
  }
}
