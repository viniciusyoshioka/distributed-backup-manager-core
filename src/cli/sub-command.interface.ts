export interface SubCommand<T extends object = object> {
  getSubCommandName(): string
  getArgs(): T
}
