import { BaseCliError } from './BaseCliError.error'


export class CliExitExecutionError extends BaseCliError {
  constructor(message: string) {
    super(message)
    this.name = CliExitExecutionError.name
  }
}
