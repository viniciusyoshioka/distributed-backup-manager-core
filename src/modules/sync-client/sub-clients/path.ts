import axios, { AxiosInstance } from 'axios'
import FormData from 'form-data'
import fs from 'node:fs'

import { PathType } from '../../file-system'
import { HashType } from '../../hash'
import { IpVersion, NetworkAddress } from '../../network'


export class PathSubClient {


  private readonly client: AxiosInstance


  constructor(serverAddress: NetworkAddress) {
    const { address, version } = serverAddress.ip
    const { port } = serverAddress

    const baseURL = version === IpVersion.IPv6
      ? `http://[${address}]:${port}/api/path/v1`
      : `http://${address}:${port}/api/path/v1`

    this.client = axios.create({ baseURL })
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


  async getFileHash(absolutePath: string, hashType = HashType.SHA_256): Promise<string | null> {
    const { data } = await this.client.get<string | null>('/file/hash', {
      params: {
        path: absolutePath,
        hashType,
      },
    })

    return data
  }

  async copyFile(fromAbsolutePath: string, toAbsolutePath: string): Promise<void> {
    const form = new FormData()

    const fileStream = fs.createReadStream(fromAbsolutePath)
    form.append('uploadFile', fileStream)
    form.append('path', toAbsolutePath)

    await this.client.post('/file/copy', form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    })
  }
}
