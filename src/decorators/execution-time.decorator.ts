
interface ExecutionTimeOptions {
  isEnabled?: boolean
}


export function ExecutionTime(options: ExecutionTimeOptions = {}): MethodDecorator {


  const isEnabled = options.isEnabled !== undefined
    ? options.isEnabled
    : process.env.EXECUTION_TIME_DECORATOR_ENABLED === 'true'


  return (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    if (!isEnabled) {
      return descriptor
    }


    const originalMethod = descriptor.value

    descriptor.value = function(...args: unknown[]): unknown {
      const startTime = performance.now()
      const result = originalMethod.apply(this, args) as unknown


      const logExecution = () => {
        const endTime = performance.now()
        const fixedExecutionTime = (endTime - startTime).toFixed(2)
        console.log(`[ExecutionTime] ${String(propertyKey)} executed in ${fixedExecutionTime}ms`)
      }


      if (result instanceof Promise) {
        return result.finally(() => {
          logExecution()
        })
      }

      logExecution()
      return result
    }


    return descriptor
  }
}
