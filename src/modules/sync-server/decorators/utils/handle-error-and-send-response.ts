import { Response } from 'express'

import { BaseException } from '../../errors/index.js'


// TODO: Improve logging
export function handleErrorAndSendResponse(params: {
  response: Response
  error: unknown
  target: Object
  propertyKey: string | symbol
}): void {
  const { response, error, target, propertyKey } = params

  if (response.headersSent) {
    return
  }

  const targetClassName = target.constructor.name
  const targetPropertyName = String(propertyKey)
  const targetPropertyPath = `${targetClassName}.${targetPropertyName}`

  console.log(`Error in ${targetPropertyPath}:`)
  console.log(error)

  if (error instanceof BaseException) {
    const status = error.getStatus()
    const body = { error: error.name, message: error.message }
    response.status(status).json(body)
    return
  }

  response.status(500).json({ message: 'Internal Server Error' })
}
