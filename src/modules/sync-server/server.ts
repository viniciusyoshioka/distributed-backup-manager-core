import express from 'express'
import 'reflect-metadata'

import { assertDotEnvIsValid, InvalidEnvVariablesError } from '../../env'
import { dataSource } from './database'
import { createPathRouterV1, createUserRouterV1 } from './entities'


function checkDotEnv(): boolean {
  try {
    assertDotEnvIsValid()
    return true
  } catch (error) {
    const { message } = error as InvalidEnvVariablesError
    console.error(message)
    return false
  }
}


async function initializeDatabase(): Promise<boolean> {
  try {
    await dataSource.initialize()
    return true
  } catch (error) {
    const { message } = error as Error
    console.error(`Failed to initialize database: "${message}"`)
    return false
  }
}


async function runDatabaseMigrations(): Promise<boolean> {
  try {
    const migrations = await dataSource.runMigrations()
    console.log(`Migrations run: ${migrations.length}`)
    return true
  } catch (error) {
    const { message } = error as Error
    console.error(`Failed to run database migrations: "${message}"`)
    return false
  }
}


async function createAndStartServer(): Promise<void> {
  const dotEnvIsValid = checkDotEnv()
  if (!dotEnvIsValid) return

  const databaseInitialized = await initializeDatabase()
  if (!databaseInitialized) return

  const migrationsRun = await runDatabaseMigrations()
  if (!migrationsRun) return


  const app = express()

  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))


  const apiRoute = express.Router()
  app.use('/api', apiRoute)

  const pathRouter = createPathRouterV1()
  apiRoute.use('/path/v1', pathRouter)

  const userRouter = createUserRouterV1(dataSource)
  apiRoute.use('/user/v1', userRouter)


  const port = process.env.PORT
  app.listen(port, () => {
    console.log(`sync-server listening at port ${port}`)
  })
}


createAndStartServer()
