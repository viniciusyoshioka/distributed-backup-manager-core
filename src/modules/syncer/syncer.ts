import fs from 'node:fs'

import { Path, PathType } from '../../utils'
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
}


export abstract class Syncer {


  protected readonly source: Path
  protected readonly destination: Path
  protected readonly exceptions: Path[]
  protected readonly exceptionMode: SyncerExceptionMode


  constructor(params: SyncerParams) {
    this.source = params.source
    this.destination = params.destination
    this.exceptions = params.exceptions ?? []
    this.exceptionMode = params.exceptionMode ?? SyncerExceptionMode.BLOCKLIST
  }


  abstract scanDiffs(): Promise<Diffs | null>

  abstract confirmDiffsToSync(diffs: Diffs): Promise<Diffs | null>

  abstract syncDiffs(diffs: Diffs): Promise<void>


  // TODO: Add support to read path on remote machines
  protected readPath(path: Path): string[] | null {
    if (!path.exists()) {
      return []
    }
    if (path.type !== PathType.DIR) {
      return null
    }
    return fs.readdirSync(path.absolutePath)
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
