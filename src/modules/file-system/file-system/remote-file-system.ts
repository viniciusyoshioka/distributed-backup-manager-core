import { HashType } from '../../hash/index.js'
import { SyncClient } from '../../sync-client/index.js'
import { Path, PathType } from '../path/index.js'
import { RelativePath } from '../relative-path/index.js'
import { FileSystem } from './file-system.js'


export interface RemoteFileSystemParams {
  syncClient: SyncClient
  localFileSystem: FileSystem
}


export class RemoteFileSystem implements FileSystem {


  private readonly syncClient: SyncClient
  private readonly localFileSystem: FileSystem


  constructor(params: RemoteFileSystemParams) {
    this.syncClient = params.syncClient
    this.localFileSystem = params.localFileSystem

    if (this.localFileSystem instanceof RemoteFileSystem) {
      throw new Error('Param localFileSystem cannot be an instance of RemoteFileSystem, it would cause an infinite recursion')
    }
  }


  private getPathArgument(path: Path | RelativePath): string {
    return path instanceof Path ? path.absolutePath : path.relativePath
  }


  async exists(path: Path | RelativePath): Promise<boolean> {
    const pathArgument = this.getPathArgument(path)

    return await this.syncClient.path.getPathExists(pathArgument)
  }


  async resolvePathType(path: Path | RelativePath): Promise<PathType> {
    const pathArgument = this.getPathArgument(path)

    const pathType = await this.syncClient.path.getPathType(pathArgument)
    path.updateType(pathType)
    return pathType
  }


  async getFileHash(
    path: Path | RelativePath,
    hashType = HashType.SHA_256,
  ): Promise<string | null> {
    const pathArgument = this.getPathArgument(path)

    const fileHash = await this.syncClient.path.getFileHash(pathArgument, hashType)
    return fileHash
  }


  async readDirectory(path: Path | RelativePath): Promise<string[] | null> {
    const pathArgument = this.getPathArgument(path)

    return await this.syncClient.path.readDirectory(pathArgument)
  }


  async createDirectory(path: Path | RelativePath): Promise<void> {
    const pathArgument = this.getPathArgument(path)

    await this.syncClient.path.createDirectory(pathArgument)
  }


  async deleteFile(path: Path | RelativePath): Promise<void> {
    const pathArgument = this.getPathArgument(path)

    await this.syncClient.path.deleteFile(pathArgument)
  }

  async deleteDirectory(path: Path | RelativePath): Promise<void> {
    const pathArgument = this.getPathArgument(path)

    await this.syncClient.path.deleteDirectory(pathArgument)
  }


  async copyFile(fromPath: Path | RelativePath, toPath: Path | RelativePath): Promise<void> {
    const fromPathIsAbsolute = fromPath instanceof Path
    const toPathIsAbsolute = toPath instanceof Path

    if (fromPathIsAbsolute && !toPathIsAbsolute) {
      const uploadedFileIdentifier = await this.syncClient.path.uploadFile(fromPath.absolutePath)
      await this.syncClient.path.moveUploadedFile(uploadedFileIdentifier, toPath.relativePath)
      return
    }
    if (!fromPathIsAbsolute && toPathIsAbsolute) {
      const downloadedFilePath = await this.syncClient.path.downloadFile(fromPath.relativePath)
      const downloadedFilePathInstance = new Path(downloadedFilePath)
      await this.localFileSystem.moveFile(downloadedFilePathInstance, toPath)
      return
    }

    if (fromPathIsAbsolute && toPathIsAbsolute) {
      throw new Error('RemoteFileSystem cannot perform operations between two paths in local file system')
    }
    throw new Error('RemoteFileSystem cannot perform operations when both paths are in remote machines')
  }


  // eslint-disable-next-line @typescript-eslint/require-await
  async moveFile(fromPath: Path | RelativePath, toPath: Path | RelativePath): Promise<void> {
    throw new Error("Move files on a remote machine, probably shouldn't be necessary")
  }
}
