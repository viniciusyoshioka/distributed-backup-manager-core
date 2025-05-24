import type { Request } from 'express'
import { RequestHandler, Router } from 'express'
import * as jose from 'jose'
import multer from 'multer'
import type { SetOptional } from 'type-fest'

import { Path, PathType } from '../../../file-system/index.js'
import { Delete, Get, Middleware, Post } from '../../decorators/index.js'
import { BadRequestException, UnauthorizedException } from '../../errors/index.js'
import type { WithAuthUser } from '../../types/index.js'
import { UserService } from '../user/user.service.js'
import { PathMapper } from './path.mapper.js'
import { PathService } from './path.service.js'


export interface PathControllerParams {
  pathService: PathService
}


export class PathController {


  private readonly pathService: PathService


  constructor(params: PathControllerParams) {
    this.pathService = params.pathService
  }


  build(): Router {
    const router = Router()
    // TODO: Create a temporary folder to receive uploads in a place the user doesn't have access to
    // TODO: Receive the absolute path from .env or cli argument (when subcommands were implemented)
    const upload = multer({ dest: 'uploads/' })


    // Path
    router.get(
      '/exists',
      this.authenticationMiddleware.bind(this) as unknown as RequestHandler,
      this.getPathExists.bind(this) as unknown as RequestHandler,
    )
    router.get(
      '/path-type',
      this.authenticationMiddleware.bind(this) as unknown as RequestHandler,
      this.getPathType.bind(this) as unknown as RequestHandler,
    )

    // File
    router.delete(
      '/file',
      this.authenticationMiddleware.bind(this) as unknown as RequestHandler,
      this.deleteFile.bind(this) as unknown as RequestHandler,
    )
    router.get(
      '/file/hash',
      this.authenticationMiddleware.bind(this) as unknown as RequestHandler,
      this.getFileHash.bind(this) as unknown as RequestHandler,
    )
    router.post(
      '/file/copy',
      this.authenticationMiddleware.bind(this) as unknown as RequestHandler,
      upload.single('uploadFile'),
      this.copyFile.bind(this) as unknown as RequestHandler,
    )

    // Directory
    router.post(
      '/directory',
      this.authenticationMiddleware.bind(this) as unknown as RequestHandler,
      this.createDirectory.bind(this) as unknown as RequestHandler,
    )
    router.delete(
      '/directory',
      this.authenticationMiddleware.bind(this) as unknown as RequestHandler,
      this.deleteDirectory.bind(this) as unknown as RequestHandler,
    )

    router.get(
      '/directory/read',
      this.authenticationMiddleware.bind(this) as unknown as RequestHandler,
      this.readDirectory.bind(this) as unknown as RequestHandler,
    )


    return router
  }


  // TODO: Move to auth module and import to use here. This middleware can be reused
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
  private async getPathExists(req: Request): Promise<boolean> {
    const query = PathMapper.fromObjectToPathParamDto(req.query)
    const pathExists = await this.pathService.getPathExists(query.path)
    return pathExists
  }


  @Get()
  private async getPathType(req: Request): Promise<PathType> {
    const query = PathMapper.fromObjectToPathParamDto(req.query)
    const pathType = await this.pathService.getPathType(query.path)
    return pathType
  }

  @Get()
  private async readDirectory(req: Request): Promise<string[] | null> {
    const query = PathMapper.fromObjectToPathParamDto(req.query)
    const pathChildren = await this.pathService.readDirectory(query.path)
    return pathChildren
  }


  @Post()
  private async createDirectory(req: Request): Promise<void> {
    const query = PathMapper.fromObjectToPathParamDto(req.body as object)
    await this.pathService.createDirectory(query.path)
  }


  @Delete()
  private async deleteFile(req: Request): Promise<void> {
    const query = PathMapper.fromObjectToPathParamDto(req.query)
    await this.pathService.deleteFile(query.path)
  }

  @Delete()
  private async deleteDirectory(req: Request): Promise<void> {
    const query = PathMapper.fromObjectToPathParamDto(req.query)
    await this.pathService.deleteDirectory(query.path)
  }


  @Get()
  private async getFileHash(req: Request): Promise<string | null> {
    const query = PathMapper.fromObjectToGetFileHashDto(req.query)
    const fileHash = await this.pathService.getFileHash(query.path, query.hashType)
    return fileHash
  }

  @Post()
  private async copyFile(req: Request): Promise<void> {
    if (!req.file?.path) {
      throw new BadRequestException('File path not received')
    }

    const query = PathMapper.fromObjectToPathParamDto(req.body as object)

    const cwd = process.cwd()
    const uploadRelativePath = req.file.path
    const pathWhereFileWasUploaded = Path.join([cwd, uploadRelativePath])

    await this.pathService.moveUploadedFile(pathWhereFileWasUploaded, query.path)
  }
}
