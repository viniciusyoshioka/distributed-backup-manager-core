import { FileSystem, Path, PathType } from '../../file-system'


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


  async resolvePathType(path: string): Promise<PathType> {
    const pathInstance = new Path(path)
    return await this.fileSystem.resolvePathType(pathInstance)
  }
}
