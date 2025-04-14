import fs, { CopySyncOptions, RmOptions } from 'node:fs'
import { stdin, stdout } from 'node:process'
import readline from 'node:readline/promises'

import { ExecutionTime } from '../../../decorators'
import { Path, PathType, Queue } from '../../../utils'
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
  async scanDiffs(): Promise<Diffs | null> {
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
  async confirmDiffsToSync(diffs: Diffs): Promise<Diffs | null> {
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
  // eslint-disable-next-line @typescript-eslint/require-await
  async syncDiffs(diffs: Diffs): Promise<void> {
    this.deletePathsInDestination(diffs.pathsToDelete)
    this.updatePathsInDestination(diffs.pathsToUpdate)
    this.createPathsInDestination(diffs.pathsToCreate)
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

    const sourcePath = new Path(this.source.absolutePath, path)
    const destinationPath = new Path(this.destination.absolutePath, path)


    const sourceChildren = this.readPath(sourcePath)
    if (!sourceChildren) {
      throw new Error(`Source path "${sourcePath.absolutePath}" is not a directory`)
    }

    const destinationChildren = this.readPath(destinationPath)
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
  // TODO: Check if sync will perform a full sync. If not, don't delete
  private async getDiffs(params: GetDiffsParams): Promise<PathDiffs> {
    const { sourceParentPath, destinationParentPath } = params
    const { sourceChildrenNames, destinationChildrenNames } = params


    const pathsToCreate: string[] = []
    const pathsToUpdate: string[] = []
    const pathsToDelete: string[] = []
    const childrenPathsToScan: string[] = []


    for (const sourceChildName of sourceChildrenNames) {
      const sourceChildPath = new Path(sourceParentPath.absolutePath, sourceChildName)
      const destinationChildPath = new Path(destinationParentPath.absolutePath, sourceChildName)
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
          sourceChildPath.calculateHash(),
          destinationChildPath.calculateHash(),
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
      const destinationChildPath = new Path(
        destinationParentPath.absolutePath,
        destinationChildName,
      )
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


  private createPathsInDestination(pathsToCreate: Queue<string>): void {
    if (pathsToCreate.isEmpty()) return

    console.log('Creating in destination:')
    while (!pathsToCreate.isEmpty()) {
      const path = pathsToCreate.dequeue()
      console.log(`\t${path}`)

      const pathFromSource = new Path(this.source.absolutePath, path)
      const pathFromDestination = new Path(this.destination.absolutePath, path)

      // TODO: Add try/catch
      const isPathCopied = this.copyPath(pathFromSource, pathFromDestination)
      if (!isPathCopied) {
        console.log(`\t\tIgnored because of unsupported type: ${pathFromSource.type}`)
      }
    }
  }

  private updatePathsInDestination(pathsToUpdate: Queue<string>): void {
    if (pathsToUpdate.isEmpty()) return

    console.log('Updating in destination:')
    while (!pathsToUpdate.isEmpty()) {
      const path = pathsToUpdate.dequeue()
      console.log(`\t${path}`)

      const pathFromSource = new Path(this.source.absolutePath, path)
      const pathFromDestination = new Path(this.destination.absolutePath, path)

      // TODO: Add try/catch
      const isPathDeleted = this.deletePath(pathFromDestination)
      const isPathCopied = this.copyPath(pathFromSource, pathFromDestination)
      if (!isPathDeleted && !isPathCopied) {
        console.log(`\t\tIgnored because of unsupported type: ${pathFromSource.type}`)
      }
    }
  }

  private deletePathsInDestination(pathsToDelete: Queue<string>): void {
    if (pathsToDelete.isEmpty()) return

    console.log('Deleting from destination:')
    while (!pathsToDelete.isEmpty()) {
      const path = pathsToDelete.dequeue()
      console.log(`\t${path}`)

      const pathFromSource = new Path(this.source.absolutePath, path)
      const pathFromDestination = new Path(this.destination.absolutePath, path)

      // TODO: Add try/catch
      const isPathDeleted = this.deletePath(pathFromDestination)
      if (!isPathDeleted) {
        console.log(`\t\tIgnored because of unsupported type: ${pathFromSource.type}`)
      }
    }
  }

  private deletePath(path: Path): boolean {
    const pathExists = path.exists()
    if (!pathExists) {
      return true
    }

    if (path.type === PathType.FILE) {
      this.deleteFile(path)
      return true
    }

    if (path.type === PathType.DIR) {
      this.deleteDir(path)
      return true
    }

    return false
  }

  private deleteFile(path: Path): void {
    const pathExists = path.exists()
    if (!pathExists) {
      throw new Error('Cannot delete file because it does not exists')
    }

    if (path.type !== PathType.FILE) {
      throw new Error('Cannot delete path with deleteFile because it is not a file')
    }

    const rmOptions: RmOptions = {
      force: true,
      recursive: true,
    }

    fs.rmSync(path.absolutePath, rmOptions)
  }

  private deleteDir(path: Path): void {
    const pathExists = path.exists()
    if (!pathExists) {
      throw new Error('Cannot delete directory because it does not exists')
    }

    if (path.type !== PathType.DIR) {
      throw new Error('Cannot delete path with deleteDir because it is not a directory')
    }

    const rmOptions: RmOptions = {
      force: true,
      recursive: true,
    }

    fs.rmSync(path.absolutePath, rmOptions)
  }

  private copyPath(fromPath: Path, toPath: Path): boolean {
    if (fromPath.type === PathType.FILE) {
      this.copyFile(fromPath, toPath)
      return true
    }

    if (fromPath.type === PathType.DIR) {
      this.copyDir(fromPath, toPath)
      return true
    }

    return false
  }

  private copyDir(fromPath: Path, toPath: Path): void {
    const fromPathExists = fromPath.exists()
    if (!fromPathExists) {
      throw new Error('Cannot copy directory from fromPath to toPath because fromPath does not exists')
    }

    if (fromPath.type !== PathType.DIR) {
      throw new Error('Cannot copy fromPath with copyDir because it is not a directory')
    }

    const toPathExists = toPath.exists()
    if (toPathExists) {
      this.deletePath(toPath)
    }

    const copySyncOptions: CopySyncOptions = {
      force: true,
      recursive: true,
    }

    fs.cpSync(fromPath.absolutePath, toPath.absolutePath, copySyncOptions)
  }

  private copyFile(fromPath: Path, toPath: Path): void {
    const fromPathExists = fromPath.exists()
    if (!fromPathExists) {
      throw new Error('Cannot copy file from fromPath to toPath because fromPath does not exists')
    }

    if (fromPath.type !== PathType.FILE) {
      throw new Error('Cannot copy fromPath with copyFile because it is not a file')
    }

    const toPathExists = toPath.exists()
    if (toPathExists) {
      this.deletePath(toPath)
    }

    const parentPath = new Path(toPath.parentAbsolutePath)
    const parentPathExists = parentPath.exists()
    if (!parentPathExists) {
      this.createDir(parentPath)
    }

    fs.copyFileSync(fromPath.absolutePath, toPath.absolutePath)
  }

  private createDir(path: Path): void {
    if (path.exists()) {
      throw new Error('Cannot create directory because something already exists in given path')
    }

    fs.mkdirSync(path.absolutePath, { recursive: true })
  }
}
