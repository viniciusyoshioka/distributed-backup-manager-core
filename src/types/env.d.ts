declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined

    STAGE: 'development' | 'production'
    EXECUTION_TIME_ENABLED?: 'true' | 'false'
  }
}
