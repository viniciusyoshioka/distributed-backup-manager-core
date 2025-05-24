import { HashType } from '../../hash/index.js'
import { SyncClient } from '../../sync-client/index.js'
import { Path, PathType } from '../path/index.js'
import { FileSystem } from './file-system.js'


export interface RemoteFileSystemParams {
  syncClient: SyncClient
}


export class RemoteFileSystem implements FileSystem {


  private readonly syncClient: SyncClient


  constructor(params: RemoteFileSystemParams) {
    this.syncClient = params.syncClient
  }


  async exists(path: Path): Promise<boolean> {
    return await this.syncClient.path.getPathExists(path.absolutePath)
  }


  async resolvePathType(path: Path): Promise<PathType> {
    const pathType = await this.syncClient.path.getPathType(path.absolutePath)
    path.updateType(pathType)
    return pathType
  }


  async getFileHash(path: Path, hashType = HashType.SHA_256): Promise<string | null> {
    const fileHash = await this.syncClient.path.getFileHash(path.absolutePath, hashType)
    return fileHash
  }


  async readDirectory(path: Path): Promise<string[] | null> {
    return await this.syncClient.path.readDirectory(path.absolutePath)
  }


  async createDirectory(path: Path): Promise<void> {
    await this.syncClient.path.createDirectory(path.absolutePath)
  }


  async deleteFile(path: Path): Promise<void> {
    await this.syncClient.path.deleteFile(path.absolutePath)
  }

  async deleteDirectory(path: Path): Promise<void> {
    await this.syncClient.path.deleteDirectory(path.absolutePath)
  }


  async copyFile(fromPath: Path, toPath: Path): Promise<void> {
    await this.syncClient.path.copyFile(fromPath.absolutePath, toPath.absolutePath)
  }


  // eslint-disable-next-line @typescript-eslint/require-await
  async moveFile(fromPath: Path, toPath: Path): Promise<void> {
    throw new Error("Move files on a remote machine, probably shouldn't be necessary")
  }
}
