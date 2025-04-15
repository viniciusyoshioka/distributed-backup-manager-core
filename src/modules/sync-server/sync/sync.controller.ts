import { Request, Response, Router } from 'express'

import { SyncService } from './sync.service'


export class SyncController {


  constructor(private readonly syncService: SyncService) {}


  build(): Router {
    const router = Router()

    router.get('/', this.get)
    router.post('/', this.post)
    router.put('/', this.put)
    router.delete('/', this.delete)

    return router
  }


  private get(req: Request, res: Response): void {}

  private post(req: Request, res: Response): void {}

  private put(req: Request, res: Response): void {}

  private delete(req: Request, res: Response): void {}
}
