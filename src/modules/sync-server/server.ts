import express from 'express'

import { assertDotEnvIsValid, InvalidEnvVariablesError } from '../../env'
import { createPathRouterV1 } from './path/utils'


function createAndStartServer(): void {
  try {
    assertDotEnvIsValid()
  } catch (error) {
    const { message } = (error as InvalidEnvVariablesError)
    console.error(message)
    return
  }


  const app = express()

  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))


  const apiRoute = express.Router()
  app.use('/api', apiRoute)

  const pathRouter = createPathRouterV1()
  apiRoute.use('/path/v1', pathRouter)


  const port = process.env.PORT
  app.listen(port, () => {
    console.log(`sync-server listening at port ${port}`)
  })
}


createAndStartServer()
