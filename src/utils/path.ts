import fs from 'node:fs'
import nodePath from 'node:path'

import { hash } from '../modules/hash'


export enum PathType {
  FILE = 'FILE',
  DIR = 'DIR',
  FILE_SYMLINK = 'FILE_SYMLINK',
  DIR_SYMLINK = 'DIR_SYMLINK',
  OTHER = 'OTHER',
  UNKNOWN = 'UNKNOWN',
}


export class Path {


  static separator = nodePath.sep

  readonly absolutePath: string
  readonly parentAbsolutePath: string
  readonly baseName: string
  readonly fileExtension: string | null

  private _type: PathType
  private _hash: string | null | undefined = undefined


  constructor(path: string | string[]) {
    const joinedPath = Array.isArray(path)
      ? nodePath.join(...path)
      : path

    this.assertPathIsAbsolute(joinedPath)

    this.absolutePath = joinedPath
    this.parentAbsolutePath = this.getParentAbsolutePath(this.absolutePath)
    this.baseName = this.getBaseName(this.absolutePath)
    this.fileExtension = this.getFileExtension(this.absolutePath)
    this._type = this.getType(this.absolutePath)
  }


  get type(): PathType {
    return this._type
  }

  get hash(): string | null | undefined {
    return this._hash
  }


  static isAbsolute(path: string): boolean {
    return nodePath.isAbsolute(path)
  }

  static exists(path: string): boolean {
    return fs.existsSync(path)
  }


  async calculateHash(): Promise<string | null> {
    this._hash = await hash(this)
    return this._hash
  }

  exists(): boolean {
    const pathExists = Path.exists(this.absolutePath)
    if (pathExists && this._type === PathType.UNKNOWN) {
      this._type = this.getType(this.absolutePath)
    }
    return pathExists
  }

  getRelativePathToRoot(rootPath: string): string {
    const isRootPathAbsolute = Path.isAbsolute(rootPath)
    if (!isRootPathAbsolute) {
      throw new Error('Root path must be absolute')
    }

    return nodePath.relative(rootPath, this.absolutePath)
  }


  private assertPathIsAbsolute(path: string): void {
    const pathIsAbsolute = Path.isAbsolute(path)
    if (!pathIsAbsolute) {
      throw new Error('Path must be absolute')
    }
  }

  private getParentAbsolutePath(path: string): string {
    this.assertPathIsAbsolute(path)

    return nodePath.dirname(path)
  }

  private getBaseName(path: string): string {
    this.assertPathIsAbsolute(path)

    return nodePath.basename(path)
  }

  private getFileExtension(path: string): string | null {
    this.assertPathIsAbsolute(path)

    const extension = nodePath.extname(path)
    return extension.length ? extension : null
  }

  private getType(path: string): PathType {
    this.assertPathIsAbsolute(path)

    const pathExists = Path.exists(path)
    if (!pathExists) {
      return PathType.UNKNOWN
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
