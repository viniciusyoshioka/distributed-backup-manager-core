import type { ExceptionResponse } from './base.exception.js'
import { BaseException } from './base.exception.js'


export class BadRequestException extends BaseException {
  constructor(message: string) {
    const response: ExceptionResponse = {
      name: 'Bad Request',
      message,
      status: 400,
    }

    super(response)
    this.name = BadRequestException.name
  }
}
