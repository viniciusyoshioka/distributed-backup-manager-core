import axios, { AxiosInstance } from 'axios'

import { NetworkAddress } from '../../../utils'


export class PathSubClient {


  private readonly client: AxiosInstance


  constructor(serverAddress: NetworkAddress) {
    const { address } = serverAddress.ip
    const { port } = serverAddress

    this.client = axios.create({
      baseURL: `http://${address}:${port}/api/path/v1`,
    })
  }
}
