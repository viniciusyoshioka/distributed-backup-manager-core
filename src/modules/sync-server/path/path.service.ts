import { FileSystem } from '../../file-system'


export interface PathServiceParams {
  fileSystem: FileSystem
}


export class PathService {


  private readonly fileSystem: FileSystem


  constructor(params: PathServiceParams) {
    this.fileSystem = params.fileSystem
  }


  // TODO: Use Path class
  // TODO: Check if path is absolute
  // TODO: Check if path is contained in root directory that is synced
  getPathExists(path: string): boolean {
    return this.fileSystem.exists(path)
  }
}
