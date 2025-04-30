import { BaseEnvVariablesError } from './BaseEnvVariablesError.error'


export class UnexpectedEnvLoadingError extends BaseEnvVariablesError {
  constructor(message: string) {
    super(message)
    this.name = UnexpectedEnvLoadingError.name
  }
}
