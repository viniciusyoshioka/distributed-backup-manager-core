import { BaseException, ExceptionResponse } from './base.exception.js'


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
