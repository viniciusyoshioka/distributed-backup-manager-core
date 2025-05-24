import { NextFunction, Request, Response } from 'express'

import { indent } from '../../../utils/index.js'
import { handleErrorAndSendResponse } from './utils/index.js'


export function Middleware(): MethodDecorator {
  return (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    const originalMethod = descriptor.value


    descriptor.value = function(...args: unknown[]): void {
      const request = args[0] as Request
      const response = args[1] as Response
      const next = args[2] as NextFunction


      const [endpointPath] = request.originalUrl.split('?', 2)
      const headers = JSON.stringify(request.headers, null, 2)

      const requestLog = [
        `[MIDDLEWARE] Request: "${endpointPath}"`,
        indent(`- Headers: ${headers}`),
      ].join('\n')
      console.log(requestLog)


      function handleMiddlewareSuccessResponse(): void {
        const responseLog = [
          `[MIDDLEWARE] Passing: "${endpointPath}"`,
        ].join('\n')
        console.log(responseLog)

        next()
      }


      try {
        const returnValue = originalMethod.apply(this, args) as unknown

        if (returnValue instanceof Promise) {
          returnValue
            .then(() => {
              handleMiddlewareSuccessResponse()
            })
            .catch((error: unknown) => {
              handleErrorAndSendResponse({ response, error, target, propertyKey })
            })
          return
        }

        handleMiddlewareSuccessResponse()
      } catch (error) {
        handleErrorAndSendResponse({ response, error, target, propertyKey })
      }
    }


    return descriptor
  }
}
