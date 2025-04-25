import { NetworkAddress } from '../network'
import { PathSubClient } from './sub-clients'


export class SyncClient {


  readonly path: PathSubClient


  constructor(serverAddress: NetworkAddress) {
    this.path = new PathSubClient(serverAddress)
  }
}
