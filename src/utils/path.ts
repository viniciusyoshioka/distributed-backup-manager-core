import fs from 'node:fs'
import nodePath from 'node:path'

import { hash } from '../modules/hash'


export enum PathType {
  FILE = 'FILE',
  DIR = 'DIR',
  FILE_SYMLINK = 'FILE_SYMLINK',
  DIR_SYMLINK = 'DIR_SYMLINK',
  OTHER = 'OTHER',
  PENDING = 'PENDING',
}


export class Path {


  static separator = nodePath.sep

  readonly relativePath: string | null
  readonly absolutePath: string
  readonly baseName: string
  readonly fileExtension: string | null
  readonly type: PathType
  private checksum?: string | null = undefined


  constructor(...path: string[]) {
    const joinedPath = path.join(Path.separator)
    const isJoinedPathAbsolute = Path.isAbsolute(joinedPath)

    this.relativePath = isJoinedPathAbsolute
      ? null
      : joinedPath
    this.absolutePath = this.toAbsolutePath(joinedPath)
    this.baseName = this.getBaseName(this.absolutePath)
    this.fileExtension = this.getFileExtension(this.absolutePath)
    this.type = this.getType(this.absolutePath)
  }


  static isAbsolute(path: string): boolean {
    return nodePath.isAbsolute(path)
  }


  async getHash(): Promise<string | null> {
    if (this.checksum === undefined) {
      this.checksum = await hash(this)
    }
    return this.checksum
  }

  exists(): boolean {
    return fs.existsSync(this.absolutePath)
  }

  getRelativePathToRoot(rootPath: string): string {
    const isRootPathAbsolute = Path.isAbsolute(rootPath)
    if (!isRootPathAbsolute) {
      throw new Error('Root path must be absolute')
    }

    return nodePath.relative(rootPath, this.absolutePath)
  }


  private toAbsolutePath(path: string): string {
    if (Path.isAbsolute(path)) {
      return path
    }
    return nodePath.resolve(path)
  }

  private getBaseName(path: string): string {
    path = this.toAbsolutePath(path)

    return nodePath.basename(path)
  }

  private getFileExtension(path: string): string | null {
    path = this.toAbsolutePath(path)

    const extension = nodePath.extname(path)
    if (!extension.length) {
      return null
    }
    return extension
  }

  private getType(path: string): PathType {
    path = this.toAbsolutePath(path)

    const pathExists = fs.existsSync(path)
    if (!pathExists) {
      return PathType.PENDING
    }

    const lStats = fs.lstatSync(path)
    if (lStats.isFile()) {
      return PathType.FILE
    }
    if (lStats.isDirectory()) {
      return PathType.DIR
    }

    if (lStats.isSymbolicLink()) {
      const stats = fs.statSync(path)
      if (stats.isFile()) {
        return PathType.FILE_SYMLINK
      }
      if (stats.isDirectory()) {
        return PathType.DIR_SYMLINK
      }
    }

    return PathType.OTHER
  }
}
