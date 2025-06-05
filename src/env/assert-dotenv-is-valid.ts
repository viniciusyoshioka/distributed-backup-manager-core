import path from 'node:path'
import { z } from 'zod'

import { InvalidEnvVariablesError } from './errors/index.js'


// TODO: Check if path validation really must be done here
const envSchema = z
  .object({
    STAGE: z.enum(['development', 'production']),
    PORT: z.number({ coerce: true }).positive(),
    EXECUTION_TIME_ENABLED: z.enum(['true', 'false']).optional(),
    SYNC_SERVER_ROOT_DESTINATION_PATH: z.string().refine(
      destinationRootPath => path.isAbsolute(destinationRootPath),
      { message: 'SYNC_SERVER_ROOT_DESTINATION_PATH must be an absolute path' },
    ),
    SYNC_SERVER_DATABASE_PATH: z.string().refine(
      databasePath => path.isAbsolute(databasePath),
      { message: 'SYNC_SERVER_DATABASE_PATH must be an absolute path' },
    ),
    SYNC_SERVER_JWT_SECRET: z.string().min(64),
    SYNC_SERVER_TMP_UPLOADS_PATH: z.string().refine(
      tmpUploadsPath => path.isAbsolute(tmpUploadsPath),
      { message: 'SYNC_SERVER_TMP_UPLOADS_PATH must be an absolute path' },
    ),
    SYNC_CLIENT_TMP_DOWNLOADS_PATH: z.string().refine(
      tmpDownloadsPath => path.isAbsolute(tmpDownloadsPath),
      { message: 'SYNC_SERVER_TMP_UPLOADS_PATH must be an absolute path' },
    ),
    ACCESS_TOKEN: z.string(),
    IDENTIFIER: z.string(),
  })
  .superRefine((arg, ctx) => {
    if (arg.EXECUTION_TIME_ENABLED === 'true' && arg.STAGE !== 'development') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['EXECUTION_TIME_ENABLED'],
        message: 'EXECUTION_TIME_ENABLED can only be "true" when STAGE is "development"',
      })
    }
  })


export function assertDotEnvIsValid() {
  const parsedEnv = envSchema.safeParse(process.env)
  if (parsedEnv.success) {
    return
  }


  const { fieldErrors } = parsedEnv.error.formErrors
  let errorMessage = 'Invalid environment variables\n'

  const fields = Object.keys(fieldErrors) as (keyof typeof fieldErrors)[]
  fields.forEach(field => {
    errorMessage += `${field}\n`

    const fieldMessages = fieldErrors[field]
    fieldMessages?.forEach(fieldMessage => {
      errorMessage += `\t- ${fieldMessage}\n`
    })
  })

  throw new InvalidEnvVariablesError(errorMessage)
}
