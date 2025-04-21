import '../../configs/env-validation'

import express from 'express'

import { createPathRouterV1 } from './path/utils'
import { createSyncRouterV1 } from './sync/utils'


function createAndStartServer(): void {
  const app = express()

  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))


  const apiRoute = express.Router()
  app.use('/api', apiRoute)

  const pathRouter = createPathRouterV1()
  apiRoute.use('/path/v1', pathRouter)

  const syncRouter = createSyncRouterV1()
  apiRoute.use('/sync/v1', syncRouter)


  const port = process.env.PORT
  app.listen(port, () => {
    console.log(`sync-server listening at port ${port}`)
  })
}


createAndStartServer()
