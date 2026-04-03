import { EnvValidator } from './env.validator.ts'


export function assertDotEnvIsValid() {
  EnvValidator.assertEnvIsValid()
}
