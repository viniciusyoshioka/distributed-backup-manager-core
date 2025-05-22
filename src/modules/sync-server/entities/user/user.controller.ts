import { Request, RequestHandler, Router } from 'express'

import { Delete, Get, Post, Put } from '../../decorators'
import { UserWithoutPasswordDTO } from './dto'
import { UserMapper } from './user.mapper'
import { UserService } from './user.service'


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


    router.get('', this.getUser.bind(this) as unknown as RequestHandler)
    router.post('', this.createUser.bind(this) as unknown as RequestHandler)
    router.put('', this.updateUser.bind(this) as unknown as RequestHandler)
    router.delete('', this.deleteUser.bind(this) as unknown as RequestHandler)
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
  private async loginUser(req: Request): Promise<void> {
    // TODO: Implement
  }
}
