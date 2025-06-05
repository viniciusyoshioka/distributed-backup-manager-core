import type { Request, Response } from 'express'
import { RequestHandler, Router } from 'express'
import * as jose from 'jose'
import multer from 'multer'
import fs from 'node:fs'
import type { SetOptional } from 'type-fest'

import { PathType } from '../../../file-system/index.js'
import { Delete, Get, Middleware, Post, Put } from '../../decorators/index.js'
import { BadRequestException, InternalServerErrorException, UnauthorizedException } from '../../errors/index.js'
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
    const upload = multer({
      dest: process.env.SYNC_SERVER_TMP_UPLOADS_PATH,
    })


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
    router.put(
      '/file/move-uploaded-file',
      this.authenticationMiddleware.bind(this) as unknown as RequestHandler,
      this.moveUploadedFile.bind(this) as unknown as RequestHandler,
    )
    router.get(
      '/file/download',
      this.authenticationMiddleware.bind(this) as unknown as RequestHandler,
      this.downloadFile.bind(this) as unknown as RequestHandler,
    )
    router.post(
      '/file/upload',
      this.authenticationMiddleware.bind(this) as unknown as RequestHandler,
      upload.single('uploadFile'),
      this.uploadFile.bind(this) as unknown as RequestHandler,
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
  private async getPathExists(req: WithAuthUser<Request>): Promise<boolean> {
    const query = PathMapper.fromObjectToPathParamDto(req.query)

    const pathExists = await this.pathService.getPathExists({
      path: query.path,
      user: req.user,
    })

    return pathExists
  }


  @Get()
  private async getPathType(req: WithAuthUser<Request>): Promise<PathType> {
    const query = PathMapper.fromObjectToPathParamDto(req.query)

    const pathType = await this.pathService.getPathType({
      path: query.path,
      user: req.user,
    })

    return pathType
  }

  @Get()
  private async readDirectory(req: WithAuthUser<Request>): Promise<string[] | null> {
    const query = PathMapper.fromObjectToPathParamDto(req.query)

    const pathChildren = await this.pathService.readDirectory({
      path: query.path,
      user: req.user,
    })

    return pathChildren
  }


  @Post()
  private async createDirectory(req: WithAuthUser<Request>): Promise<void> {
    const query = PathMapper.fromObjectToPathParamDto(req.body as object)

    await this.pathService.createDirectory({
      path: query.path,
      user: req.user,
    })
  }


  @Delete()
  private async deleteFile(req: WithAuthUser<Request>): Promise<void> {
    const query = PathMapper.fromObjectToPathParamDto(req.query)

    await this.pathService.deleteFile({
      path: query.path,
      user: req.user,
    })
  }

  @Delete()
  private async deleteDirectory(req: WithAuthUser<Request>): Promise<void> {
    const query = PathMapper.fromObjectToPathParamDto(req.query)

    await this.pathService.deleteDirectory({
      path: query.path,
      user: req.user,
    })
  }


  @Get()
  private async getFileHash(req: WithAuthUser<Request>): Promise<string | null> {
    const query = PathMapper.fromObjectToGetFileHashDto(req.query)

    const fileHash = await this.pathService.getFileHash({
      path: query.path,
      hashType: query.hashType,
      user: req.user,
    })

    return fileHash
  }

  @Put()
  private async moveUploadedFile(req: WithAuthUser<Request>): Promise<void> {
    const query = PathMapper.fromObjectToMoveUploadedFileDto(req.body as object)

    await this.pathService.moveUploadedFile({
      uploadedFilePath: query.uploadedFilePath,
      destinationPath: query.destinationPath,
      user: req.user,
    })
  }

  // @Get()
  private downloadFile(req: WithAuthUser<Request>, res: Response): void {
    const query = PathMapper.fromObjectToPathParamDto(req.query)

    const filePathToDownload = this.pathService.getFilePathToDownload({
      relativePath: query.path,
      user: req.user,
    })

    const fileReadStream = fs.createReadStream(filePathToDownload.absolutePath)
    fileReadStream.pipe(res)

    fileReadStream.on('error', error => {
      console.error('Error downloading file: ', error)
      fileReadStream.close()
      throw new InternalServerErrorException('Error downloading file')
    })

    fileReadStream.on('finish', () => {
      fileReadStream.close()
      res.sendStatus(200)
    })
  }

  @Post()
  private uploadFile(req: WithAuthUser<Request>): string {
    if (!req.file?.path) {
      throw new BadRequestException('File path not received')
    }

    const pathWhereFileWasUploaded = req.file.path
    const uploadedFileRelativePath = this.pathService.getUploadedFileRelativePathToTmpPath(
      pathWhereFileWasUploaded,
    )

    return uploadedFileRelativePath
  }
}
