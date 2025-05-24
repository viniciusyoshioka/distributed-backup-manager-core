import { BaseException, ExceptionResponse } from './base.exception.js'


export class UnauthorizedException extends BaseException {
  constructor(message: string) {
    const response: ExceptionResponse = {
      name: 'Unauthorized',
      message,
      status: 401,
    }

    super(response)
    this.name = UnauthorizedException.name
  }
}
