declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined

    STAGE: 'development' | 'production'
    PORT: string
    EXECUTION_TIME_ENABLED?: 'true' | 'false'
  }
}
