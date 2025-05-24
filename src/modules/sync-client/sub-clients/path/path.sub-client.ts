import axios, { AxiosInstance } from 'axios'
import FormData from 'form-data'
import fs from 'node:fs'

import { assertDotEnvIsValid } from '../../../../env/index.js'
import { PathType } from '../../../file-system/index.js'
import { HashType } from '../../../hash/index.js'
import { IpVersion, NetworkAddress } from '../../../network/index.js'


export class PathSubClient {


  private readonly client: AxiosInstance
  private readonly token: string


  constructor(serverAddress: NetworkAddress) {
    assertDotEnvIsValid()

    const { ip, port } = serverAddress
    const { address, version } = ip

    const baseURL = version === IpVersion.IPv6
      ? `http://[${address}]:${port}/api/path/v1`
      : `http://${address}:${port}/api/path/v1`

    this.client = axios.create({ baseURL })
    this.token = process.env.ACCESS_TOKEN
  }


  async getPathExists(absolutePath: string): Promise<boolean> {
    const { data } = await this.client.get<boolean>('/exists', {
      params: {
        path: absolutePath,
      },
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    })

    return data
  }


  async getPathType(absolutePath: string): Promise<PathType> {
    const { data } = await this.client.get<PathType>('/path-type', {
      params: {
        path: absolutePath,
      },
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    })

    return data
  }


  async readDirectory(absolutePath: string): Promise<string[] | null> {
    const { data } = await this.client.get<string[] | null>('/directory/read', {
      params: {
        path: absolutePath,
      },
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    })

    return data
  }


  async createDirectory(absolutePath: string): Promise<void> {
    await this.client.post(
      '/directory',
      {
        path: absolutePath,
      },
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      },
    )
  }


  async deleteFile(absolutePath: string): Promise<void> {
    await this.client.delete('/file', {
      params: {
        path: absolutePath,
      },
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    })
  }

  async deleteDirectory(absolutePath: string): Promise<void> {
    await this.client.delete('/directory', {
      params: {
        path: absolutePath,
      },
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    })
  }


  async getFileHash(absolutePath: string, hashType = HashType.SHA_256): Promise<string | null> {
    const { data } = await this.client.get<string | null>('/file/hash', {
      params: {
        path: absolutePath,
        hashType,
      },
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    })

    return data
  }

  async copyFile(fromAbsolutePath: string, toAbsolutePath: string): Promise<void> {
    const form = new FormData()

    const fileStream = fs.createReadStream(fromAbsolutePath)
    form.append('uploadFile', fileStream)
    form.append('path', toAbsolutePath)
    form.append('Authorization', `Bearer ${this.token}`)

    await this.client.post('/file/copy', form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    })
  }
}
