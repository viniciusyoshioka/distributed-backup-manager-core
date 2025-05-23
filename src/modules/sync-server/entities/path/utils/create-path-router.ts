import { Router } from 'express'

import { LocalFileSystem, Path } from '../../../../file-system/index.js'
import { PathController } from '../path.controller.js'
import { PathService } from '../path.service.js'


// TODO: Add the user specific folder in rootPath before passing it to PathService
export function createPathRouterV1(): Router {
  const rootDestinationPath = String(process.env.SYNC_SERVER_ROOT_DESTINATION_PATH)
  const rootPath = new Path(rootDestinationPath)

  const fileSystem = new LocalFileSystem()
  const pathService = new PathService({ fileSystem, rootPath })
  const pathController = new PathController({ pathService })
  return pathController.build()
}
