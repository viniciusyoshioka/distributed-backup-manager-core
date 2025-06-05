import { FileSystem, Path, PathType } from '../../../file-system/index.js'
import { hash, HashType } from '../../../hash/index.js'
import { BadRequestException } from '../../errors/index.js'
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

    this.assertPathIsRelativePath(uploadedFilePath)
    this.assertPathIsRelativePath(destinationPath)

    const uploadedFilePathInstance = new Path([
      process.env.SYNC_SERVER_TMP_UPLOADS_PATH,
      uploadedFilePath,
    ])
    const destinationPathInstance = new Path([
      this.rootPath.absolutePath,
      user.id,
      destinationPath,
    ])

    const uploadedFileExists = await this.fileSystem.exists(uploadedFilePathInstance)
    if (!uploadedFileExists) {
      throw new BadRequestException('Uploaded file does not exists')
    }
    const uploadedFileIsInTmpUploadsPath = this.isUploadedFileInTmpUploadsPath(
      uploadedFilePathInstance,
    )
    if (!uploadedFileIsInTmpUploadsPath) {
      await this.deleteUploadedFile(uploadedFilePathInstance)
      throw new BadRequestException('Invalid uploaded file path')
    }

    await this.fileSystem.moveFile(uploadedFilePathInstance, destinationPathInstance)
  }

  private isUploadedFileInTmpUploadsPath(uploadedFilePath: Path): boolean {
    const syncServerTmpUploadsPath = new Path(process.env.SYNC_SERVER_TMP_UPLOADS_PATH)
    const uploadedFileIsInTmpUploadsPath = uploadedFilePath.isSubPathOf(syncServerTmpUploadsPath)
    return uploadedFileIsInTmpUploadsPath
  }

  private async deleteUploadedFile(uploadedFilePath: Path): Promise<void> {
    await this.fileSystem.resolvePathType(uploadedFilePath)

    if (uploadedFilePath.type === PathType.FILE) {
      await this.fileSystem.deleteFile(uploadedFilePath)
    }
    if (uploadedFilePath.type === PathType.DIR) {
      await this.fileSystem.deleteDirectory(uploadedFilePath)
    }
  }

  getFilePathToDownload(params: {
    relativePath: string
    user: UserPayloadDTO
  }): Path {
    const { relativePath, user } = params

    this.assertPathIsRelativePath(relativePath)

    const filePathToDownload = new Path([
      process.env.SYNC_SERVER_ROOT_DESTINATION_PATH,
      user.id,
      relativePath,
    ])

    return filePathToDownload
  }

  getUploadedFileRelativePathToTmpPath(uploadedFile: string): string {
    this.assertPathIsAbsolutePath(uploadedFile)

    const syncServerTmpUploadsPath = new Path(process.env.SYNC_SERVER_TMP_UPLOADS_PATH)
    const uploadedFilePath = new Path(uploadedFile)
    return uploadedFilePath.getRelativePathToRoot(syncServerTmpUploadsPath.absolutePath)
  }
}
