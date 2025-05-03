import { Request, Response } from 'express'

import { indent } from '../../../utils'
import { handleErrorAndSendResponse } from './utils'


export function Get(): MethodDecorator {
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
        `[GET] Request: "${endpointPath}"`,
        indent(`- URL parameters: ${urlParams}`),
        indent(`- Query parameters: ${queryParams}`),
      ].join('\n')
      console.log(requestLog)


      function handleGetSuccessResponse(returnValue: unknown): void {
        const stringifiedReturnValue = typeof returnValue === 'string'
          ? returnValue
          : JSON.stringify(returnValue, null, 2)

        const responseLog = [
          `[GET] Response: "${endpointPath}"`,
          indent(`- ${stringifiedReturnValue}`),
        ].join('\n')
        console.log(responseLog)

        response.status(200).json(returnValue)
      }


      try {
        const returnValue = originalMethod.apply(this, args) as unknown

        if (returnValue instanceof Promise) {
          returnValue
            .then(result => {
              handleGetSuccessResponse(result)
            })
            .catch((error: unknown) => {
              handleErrorAndSendResponse({ response, error, target, propertyKey })
            })
          return
        }

        handleGetSuccessResponse(returnValue)
      } catch (error) {
        handleErrorAndSendResponse({ response, error, target, propertyKey })
      }
    }


    return descriptor
  }
}
