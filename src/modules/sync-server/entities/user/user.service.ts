import { hash } from 'bcryptjs'

import { BadRequestException } from '../../errors'
import { CreateUserDTO } from './dto'
import { UserEntity } from './user.entity'
import { UserRepository } from './user.repository'


const SALT_LENGTH = 10


export interface UserServiceParams {
  userRepository: UserRepository
}


export class UserService {


  private readonly userRepository: UserRepository


  constructor(params: UserServiceParams) {
    this.userRepository = params.userRepository
  }


  async getById(
    id: string,
    transaction = this.userRepository.manager,
  ): Promise<UserEntity | null> {
    const userRepo = transaction.getRepository(UserEntity)

    const user = await userRepo.findOne({
      where: { id },
    })

    return user
  }

  async getUsersByEmail(
    email: string,
    transaction = this.userRepository.manager,
  ): Promise<UserEntity[]> {
    const userRepo = transaction.getRepository(UserEntity)

    const users = await userRepo.find({
      where: { email },
    })

    return users
  }

  async createUser(
    createUser: CreateUserDTO,
    transaction = this.userRepository.manager,
  ): Promise<UserEntity> {
    const usersWithGivenEmail = await this.getUsersByEmail(createUser.email, transaction)
    if (usersWithGivenEmail.length) {
      throw new BadRequestException(`Email ${createUser.email} is already in use`)
    }

    const userRepo = transaction.getRepository(UserEntity)

    const hashedPassword = await hash(createUser.password, SALT_LENGTH)
    const createdUser = await userRepo.save({
      name: createUser.name,
      email: createUser.email,
      password: hashedPassword,
    })

    return createdUser
  }

  async deleteUser(
    id: string,
    transaction = this.userRepository.manager,
  ): Promise<UserEntity> {
    const user = await this.getById(id, transaction)
    if (!user) {
      throw new BadRequestException(`User with id ${id} does not exist`)
    }

    const userRepo = transaction.getRepository(UserEntity)
    await userRepo.delete(id)
    return user
  }
}
