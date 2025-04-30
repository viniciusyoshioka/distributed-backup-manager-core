import { z } from 'zod'

import { InvalidEnvVariablesError } from './errors'


const envSchema = z
  .object({
    STAGE: z.enum(['development', 'production']),
    PORT: z.number({ coerce: true }).positive(),
    EXECUTION_TIME_ENABLED: z.enum(['true', 'false']).optional(),
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
