import { Request, Response, Router } from 'express'
import multer from 'multer'

import { Path } from '../../file-system'
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
    router.get('/exists', this.getPathExists.bind(this))
    router.get('/path-type', this.getPathType.bind(this))

    // File
    router.delete('/file', this.deleteFile.bind(this))
    router.post('/file/copy', upload.single('uploadFile'), this.copyFile.bind(this))

    // Directory
    router.post('/directory', this.createDirectory.bind(this))
    router.delete('/directory', this.deleteDirectory.bind(this))

    router.get('/directory/read', this.readDirectory.bind(this))


    return router
  }


  private async getPathExists(req: Request, res: Response): Promise<void> {
    try {
      const query = PathMapper.fromObjectToPathParamDto(req.query)

      const pathExists = await this.pathService.getPathExists(query.path)

      res.json(pathExists)
    } catch (error) {
      console.error(`Error in ${PathController.name}.${this.getPathExists.name}`)
      console.error(error)
      res.status(500).send()
    }
  }


  private async getPathType(req: Request, res: Response): Promise<void> {
    try {
      const query = PathMapper.fromObjectToPathParamDto(req.query)

      const pathType = await this.pathService.getPathType(query.path)

      res.json(pathType)
    } catch (error) {
      console.error(`Error in ${PathController.name}.${this.getPathType.name}`)
      console.error(error)
      res.status(500).send()
    }
  }


  private async readDirectory(req: Request, res: Response): Promise<void> {
    try {
      const query = PathMapper.fromObjectToPathParamDto(req.query)

      const pathChildren = await this.pathService.readDirectory(query.path)

      res.json(pathChildren)
    } catch (error) {
      console.error(`Error in ${PathController.name}.${this.readDirectory.name}`)
      console.error(error)
      res.status(500).send()
    }
  }


  private async createDirectory(req: Request, res: Response): Promise<void> {
    try {
      const query = PathMapper.fromObjectToPathParamDto(req.body as object)

      await this.pathService.createDirectory(query.path)

      res.status(200).send()
    } catch (error) {
      console.error(`Error in ${PathController.name}.${this.createDirectory.name}`)
      console.error(error)
      res.status(500).send()
    }
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


  private async copyFile(req: Request, res: Response): Promise<void> {
    try {
      const query = PathMapper.fromObjectToPathParamDto(req.body as object)

      if (req.file?.path) {
        const cwd = process.cwd()
        const uploadRelativePath = req.file.path
        const pathWhereFileWasUploaded = Path.join([cwd, uploadRelativePath])

        await this.pathService.moveFile(pathWhereFileWasUploaded, query.path)
      }

      res.status(200).send()
    } catch (error) {
      console.error(`Error in ${PathController.name}.${this.copyFile.name}`)
      console.error(error)
      res.status(500).send()
    }
  }
}
