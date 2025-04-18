import { Path } from '../../utils'
import { FileSystem } from '../file-system'
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

  fileSystem: FileSystem
}


export abstract class Syncer {


  protected readonly source: Path
  protected readonly destination: Path
  protected readonly exceptions: Path[]
  protected readonly exceptionMode: SyncerExceptionMode
  protected readonly fileSystem: FileSystem


  constructor(params: SyncerParams) {
    this.source = params.source
    this.destination = params.destination
    this.exceptions = params.exceptions ?? []
    this.exceptionMode = params.exceptionMode ?? SyncerExceptionMode.BLOCKLIST
    this.fileSystem = params.fileSystem
  }


  abstract scanDiffs(): Promise<Diffs | null>

  abstract confirmDiffsToSync(diffs: Diffs): Promise<Diffs | null>

  abstract syncDiffs(diffs: Diffs): Promise<void>


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
