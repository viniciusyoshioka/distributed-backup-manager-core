declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined

    STAGE: 'development' | 'production'
    PORT: string
    EXECUTION_TIME_ENABLED?: 'true' | 'false'
    SYNC_SERVER_ROOT_DESTINATION_PATH: string
    SYNC_SERVER_DATABASE_PATH: string
    SYNC_SERVER_JWT_SECRET: string
  }
}
