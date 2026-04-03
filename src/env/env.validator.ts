import { isInt } from 'class-validator'
import path from 'node:path'

import { InvalidEnvVariablesError } from './errors/index.ts'


export class EnvValidator {


  static assertEnvIsValid(): void {
    try {
      this.assertPortEnvIsValid()
      this.assertExecutionTimeEnabledEnvIsValid()
      this.assertSyncServerRootDestinationPathEnvIsValid()
      this.assertSyncServerDatabasePathEnvIsValid()
      this.assertSyncServerJwtSecretEnvIsValid()
      this.assertSyncServerTmpUploadsPathEnvIsValid()
      this.assertSyncClientTmpDownloadsPathEnvIsValid()
      this.assertAccessTokenEnvIsValid()
    } catch (error) {
      console.error(error)
      throw error
    }
  }


  private static assertPortEnvIsValid(): void {
    const port = process.env['PORT']

    if (typeof port !== 'string') {
      return
    }

    const portAsNumber = Number(port)
    const isInteger = isInt(portAsNumber)
    const isPositive = portAsNumber > 0
    const isValid = isInteger && isPositive
    if (!isValid) {
      throw new InvalidEnvVariablesError(
        `Value "${port}" is invalid for "PORT" env. Expected a positive integer.`,
      )
    }
  }

  private static assertExecutionTimeEnabledEnvIsValid(): void {
    const executionTimeEnabled = process.env['EXECUTION_TIME_ENABLED']

    if (typeof executionTimeEnabled !== 'string') {
      return
    }

    const validValues = ['true', 'false']
    const isValid = validValues.includes(executionTimeEnabled)
    if (!isValid) {
      const validValuesAsString = ['true', 'false'].join(', ')
      throw new InvalidEnvVariablesError(
        `Value "${executionTimeEnabled}" is invalid for "EXECUTION_TIME_ENABLED" env. Valid values are: ${validValuesAsString}`,
      )
    }
  }

  private static assertSyncServerRootDestinationPathEnvIsValid(): void {
    const syncServerRootDestinationPath = process.env['SYNC_SERVER_ROOT_DESTINATION_PATH']

    if (typeof syncServerRootDestinationPath !== 'string') {
      throw new InvalidEnvVariablesError('Env "SYNC_SERVER_ROOT_DESTINATION_PATH" is required')
    }

    const isAbsolutePath = path.isAbsolute(syncServerRootDestinationPath)
    if (!isAbsolutePath) {
      throw new InvalidEnvVariablesError(
        `Env "SYNC_SERVER_ROOT_DESTINATION_PATH" must be an absolute path. Value "${syncServerRootDestinationPath}" is invalid.`,
      )
    }
  }

  private static assertSyncServerDatabasePathEnvIsValid(): void {
    const syncServerDatabasePath = process.env['SYNC_SERVER_DATABASE_PATH']

    if (typeof syncServerDatabasePath !== 'string') {
      throw new InvalidEnvVariablesError('Env "SYNC_SERVER_DATABASE_PATH" is required')
    }

    const isAbsolutePath = path.isAbsolute(syncServerDatabasePath)
    if (!isAbsolutePath) {
      throw new InvalidEnvVariablesError(
        `Env "SYNC_SERVER_DATABASE_PATH" must be an absolute path. Value "${syncServerDatabasePath}" is invalid.`,
      )
    }
  }

  private static assertSyncServerJwtSecretEnvIsValid(): void {
    const syncServerJwtSecret = process.env['SYNC_SERVER_JWT_SECRET']

    if (typeof syncServerJwtSecret !== 'string') {
      throw new InvalidEnvVariablesError('Env "SYNC_SERVER_JWT_SECRET" is required')
    }

    const minLength = 64
    const isValid = syncServerJwtSecret.length >= minLength
    if (!isValid) {
      throw new InvalidEnvVariablesError(
        `Value "${syncServerJwtSecret}" is invalid for "SYNC_SERVER_JWT_SECRET" env. Expected at least ${minLength} characters.`,
      )
    }
  }

  private static assertSyncServerTmpUploadsPathEnvIsValid(): void {
    const syncServerTmpUploadsPath = process.env['SYNC_SERVER_TMP_UPLOADS_PATH']

    if (typeof syncServerTmpUploadsPath !== 'string') {
      throw new InvalidEnvVariablesError('Env "SYNC_SERVER_TMP_UPLOADS_PATH" is required')
    }

    const isAbsolutePath = path.isAbsolute(syncServerTmpUploadsPath)
    if (!isAbsolutePath) {
      throw new InvalidEnvVariablesError(
        `Env "SYNC_SERVER_TMP_UPLOADS_PATH" must be an absolute path. Value "${syncServerTmpUploadsPath}" is invalid.`,
      )
    }
  }

  private static assertSyncClientTmpDownloadsPathEnvIsValid(): void {
    const syncClientTmpDownloadsPath = process.env['SYNC_CLIENT_TMP_DOWNLOADS_PATH']

    if (typeof syncClientTmpDownloadsPath !== 'string') {
      throw new InvalidEnvVariablesError(
        'Env "SYNC_CLIENT_TMP_DOWNLOADS_PATH" is required',
      )
    }

    const isAbsolutePath = path.isAbsolute(syncClientTmpDownloadsPath)
    if (!isAbsolutePath) {
      throw new InvalidEnvVariablesError(
        `Env "SYNC_CLIENT_TMP_DOWNLOADS_PATH" must be an absolute path. Value "${syncClientTmpDownloadsPath}" is invalid.`,
      )
    }
  }

  private static assertAccessTokenEnvIsValid(): void {
    const accessToken = process.env['ACCESS_TOKEN']

    if (typeof accessToken !== 'string') {
      return
    }

    const isValid = accessToken.length > 0
    if (!isValid) {
      throw new InvalidEnvVariablesError('Env "ACCESS_TOKEN" cannot be an empty string')
    }
  }
}
