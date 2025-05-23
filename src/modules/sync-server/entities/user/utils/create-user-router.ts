import { Router } from 'express'
import { DataSource } from 'typeorm'

import { UserController } from '../user.controller.js'
import { UserRepository } from '../user.repository.js'
import { UserService } from '../user.service.js'


export function createUserRouterV1(dataSource: DataSource): Router {
  const userRepository = new UserRepository(dataSource)
  const userService = new UserService({ userRepository })
  const userController = new UserController({ userService })
  return userController.build()
}
