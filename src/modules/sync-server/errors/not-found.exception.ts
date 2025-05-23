import { BaseException, ExceptionResponse } from './base.exception.js'


export class NotFoundException extends BaseException {
  constructor(message: string) {
    const response: ExceptionResponse = {
      name: 'Not Found',
      message,
      status: 404,
    }

    super(response)
    this.name = NotFoundException.name
  }
}
