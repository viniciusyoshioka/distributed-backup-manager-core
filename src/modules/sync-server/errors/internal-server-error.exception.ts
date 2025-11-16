import type { ExceptionResponse } from './base.exception.js'
import { BaseException } from './base.exception.js'


export class InternalServerErrorException extends BaseException {
  constructor(message: string) {
    const response: ExceptionResponse = {
      name: 'Internal Server Error',
      message,
      status: 500,
    }

    super(response)
    this.name = InternalServerErrorException.name
  }
}
