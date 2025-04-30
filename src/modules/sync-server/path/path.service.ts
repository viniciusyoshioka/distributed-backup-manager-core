import { FileSystem, Path, PathType } from '../../file-system'
import { hash, HashType } from '../../hash'


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


  private assertPathIsSubPathOfRoot(path: Path): void {
    const pathIsSubPathOfRoot = path.isSubPathOf(this.rootPath)
    if (!pathIsSubPathOfRoot) {
      throw new Error('Given path is not a subpath of root path')
    }
  }


  async getPathExists(path: string): Promise<boolean> {
    const pathInstance = new Path(path)
    this.assertPathIsSubPathOfRoot(pathInstance)

    return await this.fileSystem.exists(pathInstance)
  }


  async getPathType(path: string): Promise<PathType> {
    const pathInstance = new Path(path)
    this.assertPathIsSubPathOfRoot(pathInstance)

    return await this.fileSystem.resolvePathType(pathInstance)
  }


  async readDirectory(path: string): Promise<string[] | null> {
    const pathInstance = new Path(path)
    this.assertPathIsSubPathOfRoot(pathInstance)

    return await this.fileSystem.readDirectory(pathInstance)
  }


  async createDirectory(path: string): Promise<void> {
    const pathInstance = new Path(path)
    this.assertPathIsSubPathOfRoot(pathInstance)

    await this.fileSystem.createDirectory(pathInstance)
  }


  async deleteFile(path: string): Promise<void> {
    const pathInstance = new Path(path)
    this.assertPathIsSubPathOfRoot(pathInstance)

    await this.fileSystem.deleteFile(pathInstance)
  }

  async deleteDirectory(path: string): Promise<void> {
    const pathInstance = new Path(path)
    this.assertPathIsSubPathOfRoot(pathInstance)

    await this.fileSystem.deleteDirectory(pathInstance)
  }


  async getFileHash(path: string, hashType = HashType.SHA_256): Promise<string | null> {
    const pathInstance = new Path(path)
    this.assertPathIsSubPathOfRoot(pathInstance)

    return await hash(pathInstance, hashType)
  }

  async moveUploadedFile(fromPath: string, toPath: string): Promise<void> {
    // Its not required to assert that fromPath is subpath of root path
    // because it is where the file is stored by the server after upload
    const fromPathInstance = new Path(fromPath)

    const toPathInstance = new Path(toPath)
    this.assertPathIsSubPathOfRoot(toPathInstance)

    await this.fileSystem.moveFile(fromPathInstance, toPathInstance)
  }
}
