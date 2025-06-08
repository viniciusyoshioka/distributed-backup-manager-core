import { Router } from 'express'

import { SyncController } from '../sync.controller.js'


export function createSyncRouterV1(): Router {
  const syncController = new SyncController({})
  return syncController.build()
}
