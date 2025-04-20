import { Request, Response, Router } from 'express'

import { SyncService } from './sync.service'


export class SyncController {


  constructor(private readonly syncService: SyncService) {}


  build(): Router {
    const router = Router()

    router.get('/', this.get.bind(this))
    router.post('/', this.post.bind(this))
    router.put('/', this.put.bind(this))
    router.delete('/', this.delete.bind(this))

    return router
  }


  private get(req: Request, res: Response): void {}

  private post(req: Request, res: Response): void {}

  private put(req: Request, res: Response): void {}

  private delete(req: Request, res: Response): void {}
}
