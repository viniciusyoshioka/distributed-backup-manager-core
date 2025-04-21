import { Router } from 'express'

import { SyncController } from '../sync.controller'
import { SyncService } from '../sync.service'


export function createSyncRouterV1(): Router {
  const syncService = new SyncService()
  const syncController = new SyncController(syncService)
  return syncController.build()
}
