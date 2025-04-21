import { FileSystem, Path } from '../../file-system'


export interface PathServiceParams {
  fileSystem: FileSystem
}


export class PathService {


  private readonly fileSystem: FileSystem


  constructor(params: PathServiceParams) {
    this.fileSystem = params.fileSystem
  }


  // TODO: Check if path is contained in root directory that is synced
  async getPathExists(path: string): Promise<boolean> {
    const pathInstance = new Path(path)
    return await this.fileSystem.exists(pathInstance)
  }
}
