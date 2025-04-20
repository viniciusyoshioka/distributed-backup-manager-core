import { NetworkAddress } from '../../utils'
import { PathSubClient, SyncSubClient } from './sub-clients'


export class SyncClient {


  readonly path: PathSubClient
  readonly sync: SyncSubClient


  constructor(serverAddress: NetworkAddress) {
    this.path = new PathSubClient(serverAddress)
    this.sync = new SyncSubClient(serverAddress)
  }
}
