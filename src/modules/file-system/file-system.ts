import { Path, PathType } from '../../utils'


export abstract class FileSystem {
  abstract readDirectory(path: Path): Promise<string[] | null>


  abstract createDirectory(path: Path): Promise<void>


  async delete(path: Path): Promise<void> {
    if (path.type === PathType.FILE) {
      await this.deleteFile(path)
      return
    }

    if (path.type === PathType.DIR) {
      await this.deleteDirectory(path)
      return
    }

    throw new Error(`Path type ${path.type} is not supported by delete`)
  }

  abstract deleteFile(path: Path): Promise<void>

  abstract deleteDirectory(path: Path): Promise<void>


  async copy(fromPath: Path, toPath: Path): Promise<void> {
    if (fromPath.type === PathType.FILE) {
      await this.copyFile(fromPath, toPath)
      return
    }

    if (fromPath.type === PathType.DIR) {
      await this.copyDirectory(fromPath, toPath)
      return
    }

    throw new Error(`Path type ${fromPath.type} is not supported by copy`)
  }

  abstract copyFile(fromPath: Path, toPath: Path): Promise<void>

  abstract copyDirectory(fromPath: Path, toPath: Path): Promise<void>
}
