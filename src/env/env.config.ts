
export class EnvConfig {

  static get PORT(): number {
    const port = process.env['PORT']
    if (typeof port === 'string') {
      return Number(port)
    }

    const defaultPort = 4444
    return defaultPort
  }

  static get EXECUTION_TIME_ENABLED(): boolean {
    const executionTimeEnabled = process.env['EXECUTION_TIME_ENABLED']
    if (typeof executionTimeEnabled === 'string') {
      return Boolean(executionTimeEnabled)
    }

    const defaultExecutionTimeEnabled = false
    return defaultExecutionTimeEnabled
  }

  static get SYNC_SERVER_ROOT_DESTINATION_PATH(): string {
    return process.env['SYNC_SERVER_ROOT_DESTINATION_PATH']
  }

  static get SYNC_SERVER_DATABASE_PATH(): string {
    return process.env['SYNC_SERVER_DATABASE_PATH']
  }

  static get SYNC_SERVER_JWT_SECRET(): string {
    return process.env['SYNC_SERVER_JWT_SECRET']
  }

  static get SYNC_SERVER_TMP_UPLOADS_PATH(): string {
    return process.env['SYNC_SERVER_TMP_UPLOADS_PATH']
  }

  static get SYNC_CLIENT_TMP_DOWNLOADS_PATH(): string {
    return process.env['SYNC_CLIENT_TMP_DOWNLOADS_PATH']
  }

  static get ACCESS_TOKEN(): string {
    return process.env['ACCESS_TOKEN']
  }
}
