import { NetworkAddress } from '../network/index.js'
import { PathSubClient, UserSubClient } from './sub-clients/index.js'


export class SyncClient {


  readonly path: PathSubClient
  readonly user: UserSubClient


  constructor(serverAddress: NetworkAddress) {
    this.path = new PathSubClient(serverAddress)
    this.user = new UserSubClient(serverAddress)
  }
}
