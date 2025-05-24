import { FileSystem, Path, PathType } from '../../../file-system/index.js'
import { hash, HashType } from '../../../hash/index.js'
import { UserPayloadDTO } from '../user/index.js'


export interface PathServiceParams {
  fileSystem: FileSystem
  rootPath: Path
}


export class PathService {


  private readonly fileSystem: FileSystem
  private readonly rootPath: Path


  constructor(params: PathServiceParams) {
    this.fileSystem = params.fileSystem
    this.rootPath = params.rootPath
  }


  private assertPathIsAbsolutePath(path: string): void {
    const pathIsAbsolute = Path.isAbsolute(path)
    if (!pathIsAbsolute) {
      throw new Error('Given path should be an absolute path')
    }
  }

  private assertPathIsRelativePath(path: string): void {
    const pathIsAbsolute = Path.isAbsolute(path)
    if (pathIsAbsolute) {
      throw new Error('Given path should be a relative path')
    }
  }


  async getPathExists(params: {
    path: string
    user: UserPayloadDTO
  }): Promise<boolean> {
    const { path, user } = params

    this.assertPathIsRelativePath(path)
    const pathInstance = new Path([this.rootPath.absolutePath, user.id, path])

    return await this.fileSystem.exists(pathInstance)
  }


  async getPathType(params: {
    path: string
    user: UserPayloadDTO
  }): Promise<PathType> {
    const { path, user } = params

    this.assertPathIsRelativePath(path)
    const pathInstance = new Path([this.rootPath.absolutePath, user.id, path])

    return await this.fileSystem.resolvePathType(pathInstance)
  }


  async readDirectory(params: {
    path: string
    user: UserPayloadDTO
  }): Promise<string[] | null> {
    const { path, user } = params

    this.assertPathIsRelativePath(path)
    const pathInstance = new Path([this.rootPath.absolutePath, user.id, path])

    return await this.fileSystem.readDirectory(pathInstance)
  }


  async createDirectory(params: {
    path: string
    user: UserPayloadDTO
  }): Promise<void> {
    const { path, user } = params

    this.assertPathIsRelativePath(path)
    const pathInstance = new Path([this.rootPath.absolutePath, user.id, path])

    await this.fileSystem.createDirectory(pathInstance)
  }


  async deleteFile(params: {
    path: string
    user: UserPayloadDTO
  }): Promise<void> {
    const { path, user } = params

    this.assertPathIsRelativePath(path)
    const pathInstance = new Path([this.rootPath.absolutePath, user.id, path])

    await this.fileSystem.deleteFile(pathInstance)
  }

  async deleteDirectory(params: {
    path: string
    user: UserPayloadDTO
  }): Promise<void> {
    const { path, user } = params

    this.assertPathIsRelativePath(path)
    const pathInstance = new Path([this.rootPath.absolutePath, user.id, path])

    await this.fileSystem.deleteDirectory(pathInstance)
  }


  async getFileHash(params: {
    path: string
    hashType?: HashType
    user: UserPayloadDTO
  }): Promise<string | null> {
    const { path, hashType = HashType.SHA_256, user } = params

    this.assertPathIsRelativePath(path)
    const pathInstance = new Path([this.rootPath.absolutePath, user.id, path])

    await this.fileSystem.resolvePathType(pathInstance)
    return await hash(pathInstance, hashType)
  }

  async moveUploadedFile(params: {
    uploadedFilePath: string
    destinationPath: string
    user: UserPayloadDTO
  }): Promise<void> {
    const { uploadedFilePath, destinationPath, user } = params

    this.assertPathIsAbsolutePath(uploadedFilePath)
    this.assertPathIsRelativePath(destinationPath)

    // TODO: Validate uploadedFilePath to assert it is in uploaded files directory
    const uploadedFilePathInstance = new Path(uploadedFilePath)
    const destinationPathInstance = new Path([
      this.rootPath.absolutePath,
      user.id,
      destinationPath,
    ])

    await this.fileSystem.moveFile(uploadedFilePathInstance, destinationPathInstance)
  }
}
