import { Request, RequestHandler, Response, Router } from 'express'
import multer from 'multer'

import { Path, PathType } from '../../file-system'
import { Get, Post } from '../decorators'
import { BadRequestException } from '../errors'
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
    router.delete('/file', this.deleteFile.bind(this))
    router.post('/file/copy', upload.single('uploadFile'), this.copyFile.bind(this) as unknown as RequestHandler)

    // Directory
    router.post('/directory', this.createDirectory.bind(this) as unknown as RequestHandler)
    router.delete('/directory', this.deleteDirectory.bind(this))

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


  private async deleteFile(req: Request, res: Response): Promise<void> {
    try {
      const query = PathMapper.fromObjectToPathParamDto(req.params)

      await this.pathService.deleteFile(query.path)

      res.status(200).send()
    } catch (error) {
      console.error(`Error in ${PathController.name}.${this.deleteFile.name}`)
      console.error(error)
      res.status(500).send()
    }
  }

  private async deleteDirectory(req: Request, res: Response): Promise<void> {
    try {
      const query = PathMapper.fromObjectToPathParamDto(req.params)

      await this.pathService.deleteDirectory(query.path)

      res.status(200).send()
    } catch (error) {
      console.error(`Error in ${PathController.name}.${this.deleteDirectory.name}`)
      console.error(error)
      res.status(500).send()
    }
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

    await this.pathService.moveFile(pathWhereFileWasUploaded, query.path)
  }
}
