import { Request, Response } from 'express'

import { indent } from '../../../utils/index.js'
import { handleErrorAndSendResponse } from './utils/index.js'


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
        `[DELETE] Request: "${endpointPath}"`,
        indent(`- URL parameters: ${urlParams}`),
        indent(`- Query parameters: ${queryParams}`),
      ].join('\n')
      console.log(requestLog)


      function handleDeleteSuccessResponse(returnValue: unknown): void {
        if (response.headersSent) {
          console.log(`[DELETE] Response: "${endpointPath}"`)
          return
        }

        const stringifiedReturnValue = typeof returnValue === 'string'
          ? returnValue
          : JSON.stringify(returnValue, null, 2)

        const responseLog = [
          `[DELETE] Response: "${endpointPath}"`,
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
              handleDeleteSuccessResponse(result)
            })
            .catch((error: unknown) => {
              handleErrorAndSendResponse({ response, error, target, propertyKey })
            })
          return
        }

        handleDeleteSuccessResponse(returnValue)
      } catch (error) {
        handleErrorAndSendResponse({ response, error, target, propertyKey })
      }
    }


    return descriptor
  }
}
