import axios, { AxiosInstance } from 'axios'

import { PathType } from '../../file-system'
import { NetworkAddress } from '../../network'


export class PathSubClient {


  private readonly client: AxiosInstance


  constructor(serverAddress: NetworkAddress) {
    const { address } = serverAddress.ip
    const { port } = serverAddress

    this.client = axios.create({
      baseURL: `http://${address}:${port}/api/path/v1`,
    })
  }


  async exists(absolutePath: string): Promise<boolean> {
    const { data } = await this.client.get<boolean>('/exists', {
      params: {
        path: absolutePath,
      },
    })

    return data
  }


  async resolvePathType(absolutePath: string): Promise<PathType> {
    const { data } = await this.client.get<PathType>('/path-type', {
      params: {
        path: absolutePath,
      },
    })

    return data
  }
}
