import { BaseEnvVariablesError } from './BaseEnvVariablesError.error.js'


export class InvalidEnvVariablesError extends BaseEnvVariablesError {
  constructor(message: string) {
    super(message)
    this.name = InvalidEnvVariablesError.name
  }
}
