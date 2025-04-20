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
    router.get('/', this.get.bind(this))
    router.post('/', this.post.bind(this))
    router.put('/', this.put.bind(this))
    router.delete('/', this.delete.bind(this))

    return router
  }


  private getPathExists(req: Request, res: Response): void {
    try {
      const query = PathMapper.fromQueryObjectToGetPathExistsDto(req.query)

      const pathExists = this.pathService.getPathExists(query.path)

      res.json(pathExists)
    } catch (error) {
      console.error(`Error in ${PathController.name}.${this.getPathExists.name}`)
      console.error(error)
      res.status(500).send()
    }
  }
  private get(req: Request, res: Response): void {}

  private post(req: Request, res: Response): void {}

  private put(req: Request, res: Response): void {}

  private delete(req: Request, res: Response): void {}
}
