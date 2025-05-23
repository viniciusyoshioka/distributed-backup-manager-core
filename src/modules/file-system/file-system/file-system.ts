import { Path, PathType } from '../path/index.js'


export interface FileSystem {
  exists(path: Path): Promise<boolean>

  resolvePathType(path: Path): Promise<PathType>

  readDirectory(path: Path): Promise<string[] | null>

  createDirectory(path: Path): Promise<void>

  deleteFile(path: Path): Promise<void>
  deleteDirectory(path: Path): Promise<void>

  copyFile(fromPath: Path, toPath: Path): Promise<void>

  moveFile(fromPath: Path, toPath: Path): Promise<void>
}
