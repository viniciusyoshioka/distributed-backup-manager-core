import { BaseEnvVariablesError } from './BaseEnvVariablesError.error.js'


export class UnexpectedEnvLoadingError extends BaseEnvVariablesError {
  constructor(message: string) {
    super(message)
    this.name = UnexpectedEnvLoadingError.name
  }
}
