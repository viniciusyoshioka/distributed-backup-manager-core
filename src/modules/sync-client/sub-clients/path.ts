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


  async getPathExists(absolutePath: string): Promise<boolean> {
    const { data } = await this.client.get<boolean>('/exists', {
      params: {
        path: absolutePath,
      },
    })

    return data
  }


  async getPathType(absolutePath: string): Promise<PathType> {
    const { data } = await this.client.get<PathType>('/path-type', {
      params: {
        path: absolutePath,
      },
    })

    return data
  }


  async readDirectory(absolutePath: string): Promise<string[] | null> {
    const { data } = await this.client.get<string[] | null>('/directory/read', {
      params: {
        path: absolutePath,
      },
    })

    return data
  }


  async createDirectory(absolutePath: string): Promise<void> {
    await this.client.post('/directory', {
      path: absolutePath,
    })
  }


  async deleteFile(absolutePath: string): Promise<void> {
    await this.client.delete('/file', {
      params: {
        path: absolutePath,
      },
    })
  }

  async deleteDirectory(absolutePath: string): Promise<void> {
    await this.client.delete('/directory', {
      params: {
        path: absolutePath,
      },
    })
  }


  // TODO: Implement file upload. `fromPath` is uploaded and saved in
  // `toPath` on destination machine
  async copyFile(fromAbsolutePath: string, toAbsolutePath: string): Promise<void> {
    await this.client.post('/file/copy', {
      path: toAbsolutePath,
    })
  }
}
