import fs from 'node:fs'
import nodePath from 'node:path'

import { hash } from '../modules/hash'


export enum PathType {
  FILE = 'FILE',
  DIR = 'DIR',
  FILE_SYMLINK = 'FILE_SYMLINK',
  DIR_SYMLINK = 'DIR_SYMLINK',
  OTHER = 'OTHER',
}


export class Path {


  static separator = nodePath.sep

  private readonly _relativePath: string
  private readonly _absolutePath: string
  private readonly _baseName: string
  private readonly _fileExtension: string | null
  private readonly _type: PathType
  private _checksum?: string | null = undefined


  constructor(...path: string[]) {
    this._relativePath = path.join(Path.separator)
    this._absolutePath = this.toAbsolutePath(path)
    this._baseName = this.getBaseName(this._absolutePath)
    this._fileExtension = this.getFileExtension(this._absolutePath)
    this._type = this.getType(this._absolutePath)
  }


  get relativePath(): string {
    return this._relativePath
  }

  get absolutePath(): string {
    return this._absolutePath
  }

  get baseName(): string {
    return this._baseName
  }

  get fileExtension(): string | null {
    return this._fileExtension
  }

  get type(): PathType {
    return this._type
  }

  async getHash(): Promise<string | null> {
    if (this._checksum === undefined) {
      this._checksum = await hash(this)
    }
    return this._checksum
  }


  private toAbsolutePath(path: string[]): string {
    return nodePath.resolve(...path)
  }

  private getBaseName(path: string): string {
    return nodePath.basename(path)
  }

  private getFileExtension(path: string): string | null {
    const extension = nodePath.extname(path)
    if (!extension.length) {
      return null
    }
    return extension
  }

  private getType(path: string): PathType {
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
