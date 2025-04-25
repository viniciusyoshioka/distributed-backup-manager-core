import { BaseException, ExceptionResponse } from './base.exception'


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
