import { BaseCliError } from './BaseCliError.error'


export class InvalidArgumentError extends BaseCliError {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidArgumentError'
  }
}
