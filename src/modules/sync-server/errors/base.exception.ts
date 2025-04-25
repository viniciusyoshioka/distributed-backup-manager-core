export interface ExceptionResponse {
  name: string
  message: string
  status: number
}


export class BaseException extends Error {


  protected readonly response: ExceptionResponse


  constructor(response: ExceptionResponse) {
    super(response.message)

    this.name = BaseException.name
    this.response = response
  }


  getResponse(): ExceptionResponse {
    return this.response
  }

  getError(): string {
    return this.response.name
  }

  getMessage(): string {
    return this.response.message
  }

  getStatus(): number {
    return this.response.status
  }
}
