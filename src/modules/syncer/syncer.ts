import { stdin, stdout } from 'node:process'
import readline from 'node:readline/promises'

import { ExecutionTime } from '../../decorators/index.js'
import { Queue } from '../../utils/index.js'
import { FileSystem, Path, PathType } from '../file-system/index.js'
import type { Diffs, GetDiffsParams, PathDiffs } from './syncer.types.js'
import { SyncOperation } from './syncer.types.js'


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
  sourceFileSystem: FileSystem
  destinationFileSystem: FileSystem
}


export class Syncer {


  private readonly source: Path
  private readonly destination: Path
  private readonly exceptions: Path[]
  private readonly exceptionMode: SyncerExceptionMode
  private readonly skipConfirmation: boolean
  private readonly sourceFileSystem: FileSystem
  private readonly destinationFileSystem: FileSystem


  constructor(params: SyncerParams) {
    this.source = params.source
    this.destination = params.destination
    this.exceptions = params.exceptions ?? []
    this.exceptionMode = params.exceptionMode ?? SyncerExceptionMode.BLOCKLIST
    this.skipConfirmation = params.skipConfirmation ?? false
    this.sourceFileSystem = params.sourceFileSystem
    this.destinationFileSystem = params.destinationFileSystem
  }


  private async assertParamsAreValid(): Promise<void> {
    await this.sourceFileSystem.resolvePathType(this.source)
    if (this.source.type !== PathType.DIR) {
      throw new Error(`Source path "${this.source.absolutePath}" must be a directory`)
    }

    await this.destinationFileSystem.resolvePathType(this.destination)
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


  @ExecutionTime()
  private async scanDiffs(): Promise<Diffs | null> {
    const rootAbsolutePath = this.source.absolutePath
    const rootRelativePath = this.source.getRelativePathToRoot(rootAbsolutePath)

    const pathsToScan = new Queue<string>(rootRelativePath)
    const pathsToCreate = new Queue<string>()
    const pathsToUpdate = new Queue<string>()
    const pathsToDelete = new Queue<string>()

    while (!pathsToScan.isEmpty()) {
      const pathToScan = pathsToScan.dequeue()
      const scannedDiffs = await this.scanPathDiffs(pathToScan)

      scannedDiffs.childrenPathsToScan.forEach(child => pathsToScan.enqueue(child))
      scannedDiffs.pathsToCreate.forEach(path => pathsToCreate.enqueue(path))
      scannedDiffs.pathsToUpdate.forEach(path => pathsToUpdate.enqueue(path))
      scannedDiffs.pathsToDelete.forEach(path => pathsToDelete.enqueue(path))
    }

    return this.createDiffsOrNull({
      pathsToCreate,
      pathsToUpdate,
      pathsToDelete,
    })
  }

  @ExecutionTime()
  private async confirmDiffsToSync(diffs: Diffs): Promise<Diffs | null> {
    if (!this.hasAnyDiffs(diffs)) {
      return null
    }

    const confirmedPathsToCreate = await this.confirmSyncForPaths(
      diffs.pathsToCreate,
      SyncOperation.CREATE,
    )
    const confirmedPathsToUpdate = await this.confirmSyncForPaths(
      diffs.pathsToUpdate,
      SyncOperation.UPDATE,
    )
    const confirmedPathsToDelete = await this.confirmSyncForPaths(
      diffs.pathsToDelete,
      SyncOperation.DELETE,
    )

    return this.createDiffsOrNull({
      pathsToCreate: confirmedPathsToCreate,
      pathsToUpdate: confirmedPathsToUpdate,
      pathsToDelete: confirmedPathsToDelete,
    })
  }

  @ExecutionTime()
  private async syncDiffs(diffs: Diffs): Promise<void> {
    await this.deletePathsInDestination(diffs.pathsToDelete)
    await this.updatePathsInDestination(diffs.pathsToUpdate)
    await this.createPathsInDestination(diffs.pathsToCreate)
  }

  async startSync(): Promise<void> {
    await this.assertParamsAreValid()


    const pathsToConfirm = await this.scanDiffs()
    if (!pathsToConfirm) {
      console.log('No paths with diffs found')
      return
    }


    if (this.skipConfirmation) {
      await this.syncDiffs(pathsToConfirm)
      return
    }


    const pathsToSync = await this.confirmDiffsToSync(pathsToConfirm)
    if (!pathsToSync) {
      console.log('No path with diffs ware confirmed to sync')
      return
    }

    await this.syncDiffs(pathsToSync)
  }


  private hasAnyDiffs(diffs: Diffs): boolean {
    const pathsQueue = Object.values(diffs) as Queue<string>[]
    const someQueueHasItem = pathsQueue.some(queue => !queue.isEmpty())
    return someQueueHasItem
  }

  private createDiffsOrNull(diffs: Diffs): Diffs | null {
    const isEveryQueueEmpty = !this.hasAnyDiffs(diffs)
    return isEveryQueueEmpty ? null : diffs
  }


  private isPathInExceptionList(path: Path): boolean {
    const rootAbsolutePath = this.source.absolutePath

    return this.exceptions.some(exception => {
      const relativeExceptionPath = exception.getRelativePathToRoot(rootAbsolutePath)
      const relativePath = path.getRelativePathToRoot(rootAbsolutePath)
      return relativePath.startsWith(relativeExceptionPath)
    })
  }

  private isPathAllowedToSync(path: Path): boolean {
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


  private async scanPathDiffs(path: string): Promise<PathDiffs> {
    console.log(`Scanning diffs for "${path}"...`)

    const sourcePath = new Path([this.source.absolutePath, path])
    const destinationPath = new Path([this.destination.absolutePath, path])


    const sourceChildren = await this.sourceFileSystem.readDirectory(sourcePath)
    if (!sourceChildren) {
      throw new Error(`Source path "${sourcePath.absolutePath}" is not a directory`)
    }

    const destinationChildren = await this.destinationFileSystem.readDirectory(destinationPath)
    if (!destinationChildren) {
      throw new Error(`Destination path "${destinationPath.absolutePath}" is not a directory`)
    }


    return await this.getDiffs({
      sourceParentPath: sourcePath,
      destinationParentPath: destinationPath,
      sourceChildrenNames: sourceChildren,
      destinationChildrenNames: destinationChildren,
    })
  }

  // TODO: Add a 'itemsToRename' to avoid transfer files (same hash but different name)
  private async getDiffs(params: GetDiffsParams): Promise<PathDiffs> {
    const { sourceParentPath, destinationParentPath } = params
    const { sourceChildrenNames, destinationChildrenNames } = params


    const pathsToCreate: string[] = []
    const pathsToUpdate: string[] = []
    const pathsToDelete: string[] = []
    const childrenPathsToScan: string[] = []


    for (const sourceChildName of sourceChildrenNames) {
      const sourceChildPath = new Path([sourceParentPath.absolutePath, sourceChildName])
      const destinationChildPath = new Path([destinationParentPath.absolutePath, sourceChildName])

      await this.sourceFileSystem.resolvePathType(sourceChildPath)
      await this.destinationFileSystem.resolvePathType(destinationChildPath)
      const sourceRelativePath = sourceChildPath.getRelativePathToRoot(this.source.absolutePath)


      const isSourceChildAllowedToSync = this.isPathAllowedToSync(sourceChildPath)
      if (!isSourceChildAllowedToSync) {
        continue
      }


      // Create path in destination
      const destinationHasChildWithSameName = destinationChildrenNames.includes(sourceChildName)
      if (!destinationHasChildWithSameName) {
        if (sourceChildPath.type === PathType.FILE) {
          pathsToCreate.push(sourceRelativePath)
        }
        if (sourceChildPath.type === PathType.DIR) {
          childrenPathsToScan.push(sourceRelativePath)
        }
        continue
      }


      // Update path in destination (delete and create again)
      if (sourceChildPath.type !== destinationChildPath.type) {
        if (sourceChildPath.type === PathType.FILE) {
          pathsToUpdate.push(sourceRelativePath)
        }
        if (sourceChildPath.type === PathType.DIR) {
          childrenPathsToScan.push(sourceRelativePath)
        }
        continue
      }

      if (sourceChildPath.type === PathType.FILE) {
        const [sourceHash, destinationHash] = await Promise.all([
          this.sourceFileSystem.getFileHash(sourceChildPath),
          this.destinationFileSystem.getFileHash(destinationChildPath),
        ])

        if (sourceHash !== destinationHash) {
          pathsToUpdate.push(sourceRelativePath)
        }
        continue
      }


      // Is not a file to sync, so add to 'children to scan' array
      if (sourceChildPath.type === PathType.DIR) {
        childrenPathsToScan.push(sourceRelativePath)
      }
    }


    // Delete path in destination
    for (const destinationChildName of destinationChildrenNames) {
      const destinationChildPath = new Path([
        destinationParentPath.absolutePath,
        destinationChildName,
      ])
      const destinationRelativePath = destinationChildPath.getRelativePathToRoot(
        this.destination.absolutePath,
      )


      const sourceHasChildWithSameName = sourceChildrenNames.includes(destinationChildName)
      if (!sourceHasChildWithSameName) {
        pathsToDelete.push(destinationRelativePath)
        continue
      }
    }


    return {
      pathsToCreate,
      pathsToUpdate,
      pathsToDelete,
      childrenPathsToScan,
    }
  }


  private async confirmSyncForPaths(
    pathsToConfirm: Queue<string>,
    syncOperation: SyncOperation,
  ): Promise<Queue<string>> {
    const confirmedPathsToSync = new Queue<string>()
    const operationName = this.getSyncOperationName(syncOperation)

    const readLineInterface = readline.createInterface({ input: stdin, output: stdout })
    const positiveAnswers = new Set(['', 'y', 'yes'])
    const negativeAnswers = new Set(['n', 'no'])


    while (!pathsToConfirm.isEmpty()) {
      const pathToConfirm = pathsToConfirm.dequeue()

      while (true) {
        const question = `Do you want to sync (${operationName}) "${pathToConfirm}"? (y/n): `
        const answer = await readLineInterface.question(question)
        const normalizedAnswer = answer.toLowerCase().trim()

        if (positiveAnswers.has(normalizedAnswer)) {
          confirmedPathsToSync.enqueue(pathToConfirm)
          break
        }

        if (negativeAnswers.has(normalizedAnswer)) {
          break
        }

        const possibleAnswers = [...positiveAnswers, ...negativeAnswers]
          .filter(possibleAnswer => !!possibleAnswer.length)
          .map(possibleAnser => `"${possibleAnser}"`)
          .join(', ')

        console.log(`Invalid answer. Please answer with ${possibleAnswers}`)
      }
    }

    readLineInterface.close()


    return confirmedPathsToSync
  }

  private getSyncOperationName(syncOperation: SyncOperation): string {
    const syncOperationMap = {
      [SyncOperation.CREATE]: 'create',
      [SyncOperation.UPDATE]: 'update',
      [SyncOperation.DELETE]: 'delete',
    }

    const syncOperationName = syncOperationMap[syncOperation]
    if (!syncOperationName) {
      throw new Error(`Invalid sync operation: ${String(syncOperation)}`)
    }
    return syncOperationName
  }


  // TODO: Fix local and remote fileSystems not working correctly when swapping the order.
  // When the destinationFileSystem is the local machine, it is not prepared to download the file
  // or execute other file operations correctly for any expected case
  private async createPathsInDestination(pathsToCreate: Queue<string>): Promise<void> {
    if (pathsToCreate.isEmpty()) return

    console.log('Creating in destination:')
    while (!pathsToCreate.isEmpty()) {
      const path = pathsToCreate.dequeue()
      console.log(`\t${path}`)

      const pathFromSource = new Path([this.source.absolutePath, path])
      const pathFromDestination = new Path([this.destination.absolutePath, path])

      // TODO: Add try/catch
      await this.destinationFileSystem.copyFile(pathFromSource, pathFromDestination)
    }
  }

  // TODO: Fix local and remote fileSystems not working correctly when swapping the order.
  // When the destinationFileSystem is the local machine, it is not prepared to download the file
  // or execute other file operations correctly for any expected case
  private async updatePathsInDestination(pathsToUpdate: Queue<string>): Promise<void> {
    if (pathsToUpdate.isEmpty()) return

    console.log('Updating in destination:')
    while (!pathsToUpdate.isEmpty()) {
      const path = pathsToUpdate.dequeue()
      console.log(`\t${path}`)

      const pathFromSource = new Path([this.source.absolutePath, path])
      const pathFromDestination = new Path([this.destination.absolutePath, path])

      // TODO: Add try/catch
      await this.destinationFileSystem.deleteFile(pathFromDestination)
      await this.destinationFileSystem.copyFile(pathFromSource, pathFromDestination)
    }
  }

  // TODO: Fix local and remote fileSystems not working correctly when swapping the order.
  // When the destinationFileSystem is the local machine, it is not prepared to download the file
  // or execute other file operations correctly for any expected case
  private async deletePathsInDestination(pathsToDelete: Queue<string>): Promise<void> {
    if (pathsToDelete.isEmpty()) return

    console.log('Deleting from destination:')
    while (!pathsToDelete.isEmpty()) {
      const path = pathsToDelete.dequeue()
      console.log(`\t${path}`)

      const pathFromDestination = new Path([this.destination.absolutePath, path])
      await this.destinationFileSystem.resolvePathType(pathFromDestination)

      if (pathFromDestination.type === PathType.FILE) {
        // TODO: Add try/catch
        await this.destinationFileSystem.deleteFile(pathFromDestination)
        continue
      }
      if (pathFromDestination.type === PathType.DIR) {
        // TODO: Add try/catch
        await this.destinationFileSystem.deleteDirectory(pathFromDestination)
        continue
      }
    }
  }
}
