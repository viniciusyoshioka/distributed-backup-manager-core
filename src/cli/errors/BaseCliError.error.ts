export class BaseCliError extends Error {
  constructor(message: string) {
    super(message)
    this.name = BaseCliError.name
  }
}
