import { Request, RequestHandler, Router } from 'express'
import multer from 'multer'

import { Path, PathType } from '../../../file-system'
import { Delete, Get, Post } from '../../decorators'
import { BadRequestException } from '../../errors'
import { PathMapper } from './path.mapper'
import { PathService } from './path.service'


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
    router.get('/exists', this.getPathExists.bind(this) as unknown as RequestHandler)
    router.get('/path-type', this.getPathType.bind(this) as unknown as RequestHandler)

    // File
    router.delete('/file', this.deleteFile.bind(this) as unknown as RequestHandler)
    router.get('/file/hash', this.getFileHash.bind(this) as unknown as RequestHandler)
    router.post('/file/copy', upload.single('uploadFile'), this.copyFile.bind(this) as unknown as RequestHandler)

    // Directory
    router.post('/directory', this.createDirectory.bind(this) as unknown as RequestHandler)
    router.delete('/directory', this.deleteDirectory.bind(this) as unknown as RequestHandler)

    router.get('/directory/read', this.readDirectory.bind(this) as unknown as RequestHandler)


    return router
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
