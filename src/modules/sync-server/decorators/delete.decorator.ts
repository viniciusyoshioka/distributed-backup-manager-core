import { Request, Response } from 'express'

import { handleErrorAndSendResponse } from './utils'


export function Delete(): MethodDecorator {
  return (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    const originalMethod = descriptor.value


    descriptor.value = function(...args: unknown[]): void {
      const request = args[0] as Request
      const response = args[1] as Response


      const [endpointPath] = request.originalUrl.split('?', 2)
      const urlParams = JSON.stringify(request.params, null, 2)
      const queryParams = JSON.stringify(request.query, null, 2)

      const requestLog = [
        `[DELETE] "${endpointPath}"`,
        `  - URL parameters: ${urlParams}`,
        `  - Query parameters: ${queryParams}`,
      ].join('\n')
      console.log(requestLog)


      function handlePostSuccessResponse(returnValue: unknown): void {
        if (returnValue === undefined || returnValue === null) {
          response.status(204).send()
        } else {
          response.status(200).json(returnValue)
        }
      }


      try {
        const returnValue = originalMethod.apply(this, args) as unknown

        if (returnValue instanceof Promise) {
          returnValue
            .then(result => {
              handlePostSuccessResponse(result)
            })
            .catch((error: unknown) => {
              handleErrorAndSendResponse({ response, error, target, propertyKey })
            })
          return
        }

        handlePostSuccessResponse(returnValue)
      } catch (error) {
        handleErrorAndSendResponse({ response, error, target, propertyKey })
      }
    }


    return descriptor
  }
}
