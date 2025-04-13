import { z } from 'zod'


const envSchema = z
  .object({
    STAGE: z.enum(['development', 'production']),
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


const parsedEnv = envSchema.safeParse(process.env)
if (!parsedEnv.success) {
  console.error('Invalid environment variables')

  const { fieldErrors } = parsedEnv.error.formErrors
  const fields = Object.keys(fieldErrors) as (keyof typeof fieldErrors)[]
  fields.forEach(field => {
    console.error(field)

    const fieldMessages = parsedEnv.error.formErrors.fieldErrors[field]
    fieldMessages?.forEach(fieldMessage => {
      console.error(`\t- ${fieldMessage}`)
    })
  })

  process.exit(1)
}
