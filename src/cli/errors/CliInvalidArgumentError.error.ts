import { BaseCliError } from './BaseCliError.error'


export class CliInvalidArgumentError extends BaseCliError {
  constructor(message: string) {
    super(message)
    this.name = CliInvalidArgumentError.name
  }
}
