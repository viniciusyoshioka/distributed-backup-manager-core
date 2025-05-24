import type { Request } from 'express'
import { RequestHandler, Router } from 'express'

import { Delete, Get, Post, Put } from '../../decorators/index.js'
import { UserTokenDTO, UserWithoutPasswordDTO } from './dto/index.js'
import { UserMapper } from './user.mapper.js'
import { UserService } from './user.service.js'


export interface UserControllerParams {
  userService: UserService
}


export class UserController {


  private readonly userService: UserService


  constructor(params: UserControllerParams) {
    this.userService = params.userService
  }


  build(): Router {
    const router = Router()


    // router.get('', this.getUser.bind(this) as unknown as RequestHandler)
    router.post('', this.createUser.bind(this) as unknown as RequestHandler)
    // router.put('', this.updateUser.bind(this) as unknown as RequestHandler)
    router.delete('/:id', this.deleteUser.bind(this) as unknown as RequestHandler)
    router.post('/login', this.loginUser.bind(this) as unknown as RequestHandler)


    return router
  }


  @Get()
  private async getUser(req: Request): Promise<void> {
    // TODO: Implement
  }

  @Post()
  private async createUser(req: Request): Promise<UserWithoutPasswordDTO> {
    const createUserDto = UserMapper.fromObjectToCreateUserDto(req.body as object)
    const createdUser = await this.userService.createUser(createUserDto)
    return UserMapper.fromEntityToDtoWithoutPassword(createdUser)
  }

  @Put()
  private async updateUser(req: Request): Promise<void> {
    // TODO: Implement
  }

  @Delete()
  private async deleteUser(req: Request): Promise<UserWithoutPasswordDTO> {
    const { id } = req.params
    const deletedUser = await this.userService.deleteUser(id)
    return UserMapper.fromEntityToDtoWithoutPassword(deletedUser)
  }

  @Post()
  private async loginUser(req: Request): Promise<UserTokenDTO> {
    const userCredentialsDto = UserMapper.fromObjectToUserCredentialsDto(req.body as object)
    const userToken = await this.userService.loginUser(userCredentialsDto)
    return userToken
  }
}
