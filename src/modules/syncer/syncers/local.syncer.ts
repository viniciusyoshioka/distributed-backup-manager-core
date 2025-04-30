import { stdin, stdout } from 'node:process'
import readline from 'node:readline/promises'

import { ExecutionTime } from '../../../decorators'
import { Queue } from '../../../utils'
import { Path, PathType } from '../../file-system'
import { hash } from '../../hash'
import { Syncer } from '../syncer'
import { Diffs } from '../syncer.types'


interface GetDiffsParams {
  sourceParentPath: Path
  destinationParentPath: Path
  sourceChildrenNames: string[]
  destinationChildrenNames: string[]
}

interface PathDiffs {
  pathsToCreate: string[]
  pathsToUpdate: string[]
  pathsToDelete: string[]
  childrenPathsToScan: string[]
}

enum SyncOperation {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}


export class LocalSyncer extends Syncer {


  @ExecutionTime()
  protected async scanDiffs(): Promise<Diffs | null> {
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
  protected async confirmDiffsToSync(diffs: Diffs): Promise<Diffs | null> {
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
  protected async syncDiffs(diffs: Diffs): Promise<void> {
    await this.deletePathsInDestination(diffs.pathsToDelete)
    await this.updatePathsInDestination(diffs.pathsToUpdate)
    await this.createPathsInDestination(diffs.pathsToCreate)
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


  private async scanPathDiffs(path: string): Promise<PathDiffs> {
    console.log(`Scanning diffs for "${path}"...`)

    const sourcePath = new Path([this.source.absolutePath, path])
    const destinationPath = new Path([this.destination.absolutePath, path])


    const sourceChildren = await this.fileSystem.readDirectory(sourcePath)
    if (!sourceChildren) {
      throw new Error(`Source path "${sourcePath.absolutePath}" is not a directory`)
    }

    const destinationChildren = await this.fileSystem.readDirectory(destinationPath)
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

      await this.fileSystem.resolvePathType(sourceChildPath)
      await this.fileSystem.resolvePathType(destinationChildPath)
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
          hash(sourceChildPath),
          hash(destinationChildPath),
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


  private async createPathsInDestination(pathsToCreate: Queue<string>): Promise<void> {
    if (pathsToCreate.isEmpty()) return

    console.log('Creating in destination:')
    while (!pathsToCreate.isEmpty()) {
      const path = pathsToCreate.dequeue()
      console.log(`\t${path}`)

      const pathFromSource = new Path([this.source.absolutePath, path])
      const pathFromDestination = new Path([this.destination.absolutePath, path])

      // TODO: Add try/catch
      await this.fileSystem.copyFile(pathFromSource, pathFromDestination)
    }
  }

  private async updatePathsInDestination(pathsToUpdate: Queue<string>): Promise<void> {
    if (pathsToUpdate.isEmpty()) return

    console.log('Updating in destination:')
    while (!pathsToUpdate.isEmpty()) {
      const path = pathsToUpdate.dequeue()
      console.log(`\t${path}`)

      const pathFromSource = new Path([this.source.absolutePath, path])
      const pathFromDestination = new Path([this.destination.absolutePath, path])

      // TODO: Add try/catch
      await this.fileSystem.deleteFile(pathFromDestination)
      await this.fileSystem.copyFile(pathFromSource, pathFromDestination)
    }
  }

  private async deletePathsInDestination(pathsToDelete: Queue<string>): Promise<void> {
    if (pathsToDelete.isEmpty()) return

    console.log('Deleting from destination:')
    while (!pathsToDelete.isEmpty()) {
      const path = pathsToDelete.dequeue()
      console.log(`\t${path}`)

      const pathFromDestination = new Path([this.destination.absolutePath, path])

      // TODO: Add try/catch
      await this.fileSystem.deleteFile(pathFromDestination)
    }
  }
}
