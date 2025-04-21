import axios, { AxiosInstance } from 'axios'

import { NetworkAddress } from '../../network'
import { GetPathExistsResponseDTO } from '../../sync-server'


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
    const { data } = await this.client.get<GetPathExistsResponseDTO>('/exists', {
      params: {
        path: absolutePath,
      },
    })

    return data.exists
  }
}
