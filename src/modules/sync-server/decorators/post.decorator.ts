import { Request, Response } from 'express'

import { handleErrorAndSendResponse } from './utils'


export function Post(): MethodDecorator {
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
      const body = JSON.stringify(request.body, null, 2)

      const requestLog = [
        `[POST] "${endpointPath}"`,
        `  - URL parameters: ${urlParams}`,
        `  - Query parameters: ${queryParams}`,
        `  - Body: ${body}`,
      ].join('\n')
      console.log(requestLog)


      function handlePostSuccessResponse(returnValue: unknown): void {
        if (returnValue === undefined || returnValue === null) {
          response.status(201).send()
        } else {
          response.status(201).json(returnValue)
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
