import { BaseCliError } from './BaseCliError.error'


export class ExitExecutionError extends BaseCliError {
  constructor(message: string) {
    super(message)
    this.name = 'ExitExecutionError'
  }
}
