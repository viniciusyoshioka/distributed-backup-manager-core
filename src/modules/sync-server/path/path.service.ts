import { FileSystem, Path, PathType } from '../../file-system'
import { hash, HashType } from '../../hash'


export interface PathServiceParams {
  fileSystem: FileSystem
}


// TODO: Check if path is contained in root directory that is synced
export class PathService {


  private readonly fileSystem: FileSystem


  constructor(params: PathServiceParams) {
    this.fileSystem = params.fileSystem
  }


  async getPathExists(path: string): Promise<boolean> {
    const pathInstance = new Path(path)
    return await this.fileSystem.exists(pathInstance)
  }


  async getPathType(path: string): Promise<PathType> {
    const pathInstance = new Path(path)
    return await this.fileSystem.resolvePathType(pathInstance)
  }


  async readDirectory(path: string): Promise<string[] | null> {
    const pathInstance = new Path(path)
    return await this.fileSystem.readDirectory(pathInstance)
  }


  async createDirectory(path: string): Promise<void> {
    const pathInstance = new Path(path)
    await this.fileSystem.createDirectory(pathInstance)
  }


  async deleteFile(path: string): Promise<void> {
    const pathInstance = new Path(path)
    await this.fileSystem.deleteFile(pathInstance)
  }

  async deleteDirectory(path: string): Promise<void> {
    const pathInstance = new Path(path)
    await this.fileSystem.deleteDirectory(pathInstance)
  }


  async getFileHash(path: string, hashType = HashType.SHA_256): Promise<string | null> {
    const pathInstance = new Path(path)
    return await hash(pathInstance, hashType)
  }

  async moveFile(fromPath: string, toPath: string): Promise<void> {
    const fromPathInstance = new Path(fromPath)
    const toPathInstance = new Path(toPath)
    await this.fileSystem.moveFile(fromPathInstance, toPathInstance)
  }
}
