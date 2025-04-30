import { FileSystem, Path, PathType } from '../file-system'
import { Diffs } from './syncer.types'


export enum SyncerExceptionMode {
  ALLOWLIST = 'ALLOWLIST',
  BLOCKLIST = 'BLOCKLIST',
}


export interface SyncerParams {
  source: Path
  destination: Path

  /**
   * List of paths to allow or to block when syncing.
   * The behavior changes according to the `exceptionMode`.
   * - If `exceptionMode` is `SyncerMode.ALLOWLIST`, all paths will be ignored,
   * except the ones in this list.
   * - If `exceptionMode` is `SyncerMode.BLOCKLIST`, all paths will be synced,
   * except the ones in this list.
   *
   * Default: `[]`
   */
  exceptions?: Path[]

  /**
   * - When `SyncerExceptionMode.ALLOWLIST`, all paths in `exceptions` will be synced.
   * - When `SyncerExceptionMode.BLOCKLIST`, all paths in `exceptions` will be ignored.
   *
   * Default: `SyncerMode.BLOCKLIST`
   */
  exceptionMode?: SyncerExceptionMode

  skipConfirmation?: boolean
  fileSystem: FileSystem
}


export abstract class Syncer {


  protected readonly source: Path
  protected readonly destination: Path
  protected readonly exceptions: Path[]
  protected readonly exceptionMode: SyncerExceptionMode
  protected readonly skipConfirmation: boolean
  protected readonly fileSystem: FileSystem


  constructor(params: SyncerParams) {
    this.source = params.source
    this.destination = params.destination
    this.exceptions = params.exceptions ?? []
    this.exceptionMode = params.exceptionMode ?? SyncerExceptionMode.BLOCKLIST
    this.skipConfirmation = params.skipConfirmation ?? false
    this.fileSystem = params.fileSystem
  }


  private async assertParamsAreValid(): Promise<void> {
    await this.fileSystem.resolvePathType(this.source)
    if (this.source.type !== PathType.DIR) {
      throw new Error(`Source path "${this.source.absolutePath}" must be a directory`)
    }

    await this.fileSystem.resolvePathType(this.destination)
    if (this.destination.type !== PathType.DIR) {
      throw new Error(`Destination path "${this.destination.absolutePath}" must be a directory`)
    }

    this.exceptions.forEach(exception => {
      const exceptionPathIsSubPathOfSource = exception.isSubPathOf(this.source)
      if (!exceptionPathIsSubPathOfSource) {
        throw new Error(`Exception path "${exception.absolutePath}" is not a subpath of source path "${this.source.absolutePath}"`)
      }
    })
  }


  protected abstract scanDiffs(): Promise<Diffs | null>

  protected abstract confirmDiffsToSync(diffs: Diffs): Promise<Diffs | null>

  protected abstract syncDiffs(diffs: Diffs): Promise<void>

  async startSync(): Promise<void> {
    await this.assertParamsAreValid()


    const pathsToConfirm = await this.scanDiffs()
    if (!pathsToConfirm) {
      // TODO: Add custom error
      throw new Error('No path with diffs found on scan')
    }


    if (this.skipConfirmation) {
      await this.syncDiffs(pathsToConfirm)
      return
    }


    const pathsToSync = await this.confirmDiffsToSync(pathsToConfirm)
    if (!pathsToSync) {
      // TODO: Add custom error
      throw new Error('No path with diffs found on confirmation')
    }

    await this.syncDiffs(pathsToSync)
  }


  protected isPathInExceptionList(path: Path): boolean {
    const rootAbsolutePath = this.source.absolutePath

    return this.exceptions.some(exception => {
      const relativeExceptionPath = exception.getRelativePathToRoot(rootAbsolutePath)
      const relativePath = path.getRelativePathToRoot(rootAbsolutePath)
      return relativePath.startsWith(relativeExceptionPath)
    })
  }

  protected isPathAllowedToSync(path: Path): boolean {
    const pathIsInExceptionList = this.isPathInExceptionList(path)
    switch (this.exceptionMode) {
      case SyncerExceptionMode.ALLOWLIST:
        return pathIsInExceptionList
      case SyncerExceptionMode.BLOCKLIST:
        return !pathIsInExceptionList
      default:
        throw new Error(`Invalid exception mode: ${String(this.exceptionMode)}`)
    }
  }
}
