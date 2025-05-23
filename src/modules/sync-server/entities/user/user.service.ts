import { compare, hash } from 'bcryptjs'
import { validate } from 'class-validator'
import { jwtVerify, SignJWT } from 'jose'

import { BadRequestException, NotFoundException } from '../../errors/index.js'
import { CreateUserDTO, UserCredentialsDTO, UserPayloadDTO, UserTokenDTO } from './dto/index.js'
import { UserEntity } from './user.entity.js'
import { UserRepository } from './user.repository.js'


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

  async loginUser(
    userCredentials: UserCredentialsDTO,
    transaction = this.userRepository.manager,
  ): Promise<UserTokenDTO> {
    const users = await this.getUsersByEmail(userCredentials.email, transaction)
    const user = users[0] as UserEntity | undefined
    if (!user) {
      throw new NotFoundException('Invalid user or password')
    }

    const passwordIsValid = await compare(userCredentials.password, user.password)
    if (!passwordIsValid) {
      throw new NotFoundException('Invalid user or password')
    }

    const secret = new TextEncoder().encode(process.env.SYNC_SERVER_JWT_SECRET)
    const payload = { id: user.id, name: user.name, email: user.email }

    const signedJwtToken = await new SignJWT(payload)
      .setExpirationTime('1h')
      .sign(secret)

    return {
      token: signedJwtToken,
    }
  }

  async validateJwtToken(token: string): Promise<UserPayloadDTO> {
    const secret = new TextEncoder().encode(process.env.SYNC_SERVER_JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)

    const userPayload = new UserPayloadDTO()
    Object.assign(userPayload, payload)

    const errors = await validate(userPayload)
    if (errors.length) {
      throw new BadRequestException('Invalid token')
    }

    return userPayload
  }
}
