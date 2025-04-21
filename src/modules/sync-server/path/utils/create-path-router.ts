import { Router } from 'express'

import { LocalFileSystem } from '../../../file-system'
import { PathController } from '../path.controller'
import { PathService } from '../path.service'


export function createPathRouterV1(): Router {
  const fileSystem = new LocalFileSystem()
  const pathService = new PathService({ fileSystem })
  const pathController = new PathController({ pathService })
  return pathController.build()
}
