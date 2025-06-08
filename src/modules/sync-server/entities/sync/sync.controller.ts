import type { Request, RequestHandler } from 'express'
import { Router } from 'express'
import * as jose from 'jose'
import type { SetOptional } from 'type-fest'

import { Get, Middleware } from '../../decorators/index.js'
import { UnauthorizedException } from '../../errors/index.js'
import type { WithAuthUser } from '../../types/index.js'
import { UserService } from '../user/user.service.js'
import type { HandshakeProtocol } from './utils/index.js'
import { CURRENT_HANDSHAKE_PROTOCOL } from './utils/index.js'


export interface SyncControllerParams {}


export class SyncController {


  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(params: SyncControllerParams) {}


  build(): Router {
    const router = Router()


    router.get(
      '/handshake',
      this.authenticationMiddleware.bind(this),
      this.handshake.bind(this) as unknown as RequestHandler,
    )


    return router
  }


  // TODO: Remove duplicated middleware
  @Middleware()
  private async authenticationMiddleware(
    req: SetOptional<WithAuthUser<Request>, 'user'>,
  ): Promise<void> {
    const authorizationHeader = req.headers['authorization']
    if (!authorizationHeader) {
      throw new UnauthorizedException('Authorization header is missing')
    }

    const [bearer, token] = authorizationHeader.split(' ', 2)
    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization header format')
    }

    try {
      const userPayload = await UserService.validateJwtToken(token)
      req.user = userPayload
    } catch (error) {
      if (error instanceof jose.errors.JWTExpired) {
        throw new UnauthorizedException('JWT token has expired')
      }
      throw new UnauthorizedException('Invalid or malformed JWT token')
    }
  }


  @Get()
  private handshake(): HandshakeProtocol {
    return CURRENT_HANDSHAKE_PROTOCOL
  }
}
