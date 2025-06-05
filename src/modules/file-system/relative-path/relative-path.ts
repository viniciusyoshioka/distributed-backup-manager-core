import path from 'node:path'

import { Path, PathType } from '../path/index.js'


export class RelativePath {


  readonly relativePath: string
  readonly parentRelativePath: string
  readonly baseName: string
  readonly fileExtension: string | null

  private _type = PathType.UNKNOWN


  constructor(relativePath: string | string[]) {
    const joinedRelativePath = Path.join(relativePath)

    this.relativePath = joinedRelativePath
    this.parentRelativePath = RelativePath.getParentPathAsRelativePath(this.relativePath)
    this.baseName = RelativePath.getBaseName(this.relativePath)
    this.fileExtension = RelativePath.getFileExtension(this.relativePath)
  }


  get type(): PathType {
    return this._type
  }

  updateType(type: PathType): void {
    this._type = type
  }


  static getParentPathAsRelativePath(relativePath: string): string {
    return path.dirname(relativePath)
  }

  static getBaseName(relativePath: string): string {
    return path.basename(relativePath)
  }

  static getFileExtension(relativePath: string): string | null {
    const extension = path.extname(relativePath)
    return extension.length ? extension : null
  }

  /**
   * Solve the relative path from `fromPath` to `toPath` based on the current working directory.
   *
   * @example
   * const pathA = '/path/to/a/file'
   * const pathB = '/path/to/a/file/in/somewhere'
   * getRelativePathBetweenPaths(pathA, pathB) // './in/somewhere'
   */
  static getRelativePathBetweenPaths(fromPath: string, toPath: string): string {
    return path.relative(fromPath, toPath)
  }

  static isPathSubPathOfBasePath(basePath: string, subPath: string): boolean {
    const possibleSeparatorsAtEndOfPathRegex = /(\\|\/)+$/
    const normalizedBasePath = basePath.replace(possibleSeparatorsAtEndOfPathRegex, '')
    const normalizedSubPath = subPath.replace(possibleSeparatorsAtEndOfPathRegex, '')
    return normalizedSubPath.startsWith(normalizedBasePath)
  }


  isSubPathOf(rootPath: RelativePath): boolean {
    return RelativePath.isPathSubPathOfBasePath(rootPath.relativePath, this.relativePath)
  }

  getRelativePathToRoot(rootPath: string): string {
    return RelativePath.getRelativePathBetweenPaths(rootPath, this.relativePath)
  }
}
