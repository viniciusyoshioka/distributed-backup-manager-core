import { Path, PathType } from '../path'


export interface FileSystem {
  exists(path: Path): boolean

  resolvePathType(path: Path): PathType

  readDirectory(path: Path): string[] | null

  createDirectory(path: Path): void

  delete(path: Path): void
  deleteFile(path: Path): void
  deleteDirectory(path: Path): void

  copy(fromPath: Path, toPath: Path): void
  copyFile(fromPath: Path, toPath: Path): void
  copyDirectory(fromPath: Path, toPath: Path): void
}
