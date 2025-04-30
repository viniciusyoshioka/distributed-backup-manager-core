import path from 'node:path'

import { PathType } from './path.types'


export class Path {


  readonly absolutePath: string
  readonly parentAbsolutePath: string
  readonly baseName: string
  readonly fileExtension: string | null

  private _type = PathType.UNKNOWN


  constructor(pathOrPathParts: string | string[]) {
    const joinedPath = Path.join(pathOrPathParts)
    Path.assertPathIsAbsolute(joinedPath)

    this.absolutePath = joinedPath
    this.parentAbsolutePath = Path.getParentPathAsAbsolutePath(this.absolutePath)
    this.baseName = Path.getBaseName(this.absolutePath)
    this.fileExtension = Path.getFileExtension(this.absolutePath)
  }


  get type(): PathType {
    return this._type
  }

  updateType(type: PathType): void {
    this._type = type
  }


  static normalize(pathToNormalize: string): string {
    return path.normalize(pathToNormalize)
  }

  static join(pathOrPathParts: string | string[]): string {
    if (Array.isArray(pathOrPathParts)) {
      return path.join(...pathOrPathParts)
    }
    return Path.normalize(pathOrPathParts)
  }

  static isAbsolute(pathToCheck: string): boolean {
    return path.isAbsolute(pathToCheck)
  }

  private static assertPathIsAbsolute(pathToCheck: string, customErrorMessage?: string): void {
    const pathIsAbsolute = Path.isAbsolute(pathToCheck)
    if (!pathIsAbsolute) {
      const errorMessage = customErrorMessage ?? 'Path must be absolute'
      throw new Error(errorMessage)
    }
  }

  static getParentPathAsAbsolutePath(absolutePath: string): string {
    Path.assertPathIsAbsolute(absolutePath)
    return path.dirname(absolutePath)
  }

  static getBaseName(absolutePath: string): string {
    Path.assertPathIsAbsolute(absolutePath)
    return path.basename(absolutePath)
  }

  static getFileExtension(absolutePath: string): string | null {
    Path.assertPathIsAbsolute(absolutePath)
    const extension = path.extname(absolutePath)
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
    Path.assertPathIsAbsolute(fromPath, 'From path must be absolute')
    Path.assertPathIsAbsolute(toPath, 'To path must be absolute')
    return path.relative(fromPath, toPath)
  }

  static isPathSubPathOfBasePath(basePath: string, subPath: string): boolean {
    Path.assertPathIsAbsolute(basePath, 'Base path must be absolute')
    Path.assertPathIsAbsolute(subPath, 'Subpath must be absolute')

    const possibleSeparatorsAtEndOfPathRegex = /(\\|\/)+$/
    const normalizedBasePath = basePath.replace(possibleSeparatorsAtEndOfPathRegex, '')
    const normalizedSubPath = subPath.replace(possibleSeparatorsAtEndOfPathRegex, '')
    return normalizedSubPath.startsWith(normalizedBasePath)
  }


  isSubPathOf(rootPath: Path): boolean {
    return Path.isPathSubPathOfBasePath(rootPath.absolutePath, this.absolutePath)
  }

  getRelativePathToRoot(rootPath: string): string {
    return Path.getRelativePathBetweenPaths(rootPath, this.absolutePath)
  }
}
