export class BaseEnvVariablesError extends Error {
  constructor(message: string) {
    super(message)
    this.name = BaseEnvVariablesError.name
  }
}
