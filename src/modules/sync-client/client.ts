import { NetworkAddress } from '../network/index.js'
import { PathSubClient, SyncSubClient, UserSubClient } from './sub-clients/index.js'


export class SyncClient {


  readonly path: PathSubClient
  readonly sync: SyncSubClient
  readonly user: UserSubClient


  constructor(serverAddress: NetworkAddress) {
    this.path = new PathSubClient(serverAddress)
    this.sync = new SyncSubClient(serverAddress)
    this.user = new UserSubClient(serverAddress)
  }
}
