import axios, { AxiosInstance } from 'axios'
import FormData from 'form-data'
import fs from 'node:fs'
import { v4 } from 'uuid'

import { assertDotEnvIsValid } from '../../../../env/index.js'
import { Path, PathType } from '../../../file-system/index.js'
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

  async moveUploadedFile(uploadedFilePath: string, destinationPath: string): Promise<void> {
    await this.client.put(
      '/file/move-uploaded-file',
      {
        uploadedFilePath,
        destinationPath,
      },
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      },
    )
  }

  async downloadFile(relativePath: string): Promise<string> {
    const response = await this.client.get(`/file/download`, {
      params: {
        path: relativePath,
      },
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      responseType: 'stream',
    })

    return await new Promise<string>((resolve, reject) => {
      const tmpDownloadedFilePath = new Path([
        process.env.SYNC_CLIENT_TMP_DOWNLOADS_PATH,
        v4(),
      ])

      const tmpDownloadedFileStream = fs.createWriteStream(tmpDownloadedFilePath.absolutePath)

      tmpDownloadedFileStream.on('finish', () => {
        tmpDownloadedFileStream.close()
        resolve(tmpDownloadedFilePath.absolutePath)
      })

      tmpDownloadedFileStream.on('error', error => {
        tmpDownloadedFileStream.close()
        reject(error)
      })

      response.data.pipe(tmpDownloadedFileStream)
    })
  }

  async uploadFile(absolutePath: string): Promise<string> {
    const form = new FormData()

    const fileStream = fs.createReadStream(absolutePath)
    form.append('uploadFile', fileStream)

    const { data } = await this.client.post<string>('/file/upload', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${this.token}`,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    })

    return data
  }
}
