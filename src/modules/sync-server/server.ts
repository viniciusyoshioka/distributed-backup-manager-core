import express, { Express } from 'express'

import { createPathRouterV1 } from './path'
import { createSyncRouterV1 } from './sync'


export function createServer(): Express {
  const app = express()

  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))


  const apiRoute = express.Router()
  app.use('/api', apiRoute)

  const pathRouter = createPathRouterV1()
  apiRoute.use('/path/v1', pathRouter)

  const syncRouter = createSyncRouterV1()
  apiRoute.use('/sync/v1', syncRouter)


  return app
}
