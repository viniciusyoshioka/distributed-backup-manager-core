import { Request, Response, Router } from 'express'

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

    router.get('/exists', this.getPathExists.bind(this))
    router.get('/path-type', this.resolvePathType.bind(this))

    return router
  }


  private async getPathExists(req: Request, res: Response): Promise<void> {
    try {
      const query = PathMapper.fromQueryObjectToGetPathExistsDto(req.query)

      const pathExists = await this.pathService.getPathExists(query.path)

      res.json(pathExists)
    } catch (error) {
      console.error(`Error in ${PathController.name}.${this.getPathExists.name}`)
      console.error(error)
      res.status(500).send()
    }
  }


  private async resolvePathType(req: Request, res: Response): Promise<void> {
    try {
      const query = PathMapper.fromQueryObjectToResolvePathTypeDto(req.query)

      const pathType = await this.pathService.resolvePathType(query.path)

      res.json(pathType)
    } catch (error) {
      console.error(`Error in ${PathController.name}.${this.resolvePathType.name}`)
      console.error(error)
      res.status(500).send()
    }
  }
}
