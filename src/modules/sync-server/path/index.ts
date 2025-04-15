import { Router } from 'express'

import { PathController } from './path.controller'
import { PathService } from './path.service'


export function createPathRouterV1(): Router {
  const pathService = new PathService()
  const pathController = new PathController(pathService)
  return pathController.build()
}
