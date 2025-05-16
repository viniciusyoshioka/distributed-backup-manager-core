import { Router } from 'express'
import { DataSource } from 'typeorm'

import { UserController } from '../user.controller'
import { UserRepository } from '../user.repository'
import { UserService } from '../user.service'


export function createUserRouterV1(dataSource: DataSource): Router {
  const userRepository = new UserRepository(dataSource)
  const userService = new UserService({ userRepository })
  const userController = new UserController({ userService })
  return userController.build()
}
