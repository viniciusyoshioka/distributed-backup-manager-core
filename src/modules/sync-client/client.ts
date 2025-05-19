import { NetworkAddress } from '../network'
import { PathSubClient, UserSubClient } from './sub-clients'


export class SyncClient {


  readonly path: PathSubClient
  readonly user: UserSubClient


  constructor(serverAddress: NetworkAddress) {
    this.path = new PathSubClient(serverAddress)
    this.user = new UserSubClient(serverAddress)
  }
}
