import './configs/env-validation'

import { LocalFileSystem } from './modules/file-system'
import { LocalSyncer } from './modules/syncer'
import { Path } from './utils'


function exceptionsToPath(sourcePath: Path, exceptions: string[]): Path[] {
  return exceptions.map(path => new Path(sourcePath.absolutePath, path))
}


async function main() {
  try {
    const sourcePath = new Path('')
    const destinationPath = new Path('')
    const exceptions: string[] = [
    ]

    const syncer = new LocalSyncer({
      source: sourcePath,
      destination: destinationPath,
      exceptions: exceptionsToPath(sourcePath, exceptions),
      fileSystem: new LocalFileSystem(),
    })

    const pathsToConfirm = await syncer.scanDiffs()
    if (!pathsToConfirm) {
      console.log('No path with diffs found on scan')
      process.exit(0)
    }

    const pathsToSync = await syncer.confirmDiffsToSync(pathsToConfirm)
    if (!pathsToSync) {
      console.log('No path with diffs was confirmed to be synced')
      process.exit(0)
    }

    await syncer.syncDiffs(pathsToSync)
  } catch (error) {
    console.error(error)
  }
}


main()
