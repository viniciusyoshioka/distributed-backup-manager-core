import { HashType } from '../../hash/index.js'
import { Path, PathType } from '../path/index.js'
import { RelativePath } from '../relative-path/index.js'


export interface FileSystem {
  exists(path: Path | RelativePath): Promise<boolean>

  resolvePathType(path: Path | RelativePath): Promise<PathType>

  getFileHash(path: Path | RelativePath, hashType?: HashType): Promise<string | null>

  readDirectory(path: Path | RelativePath): Promise<string[] | null>

  createDirectory(path: Path | RelativePath): Promise<void>

  deleteFile(path: Path | RelativePath): Promise<void>
  deleteDirectory(path: Path | RelativePath): Promise<void>

  copyFile(fromPath: Path | RelativePath, toPath: Path | RelativePath): Promise<void>

  moveFile(fromPath: Path | RelativePath, toPath: Path | RelativePath): Promise<void>
}
