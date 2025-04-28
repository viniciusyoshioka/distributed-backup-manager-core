import { Cli, ExitExecutionError, InvalidArgumentError, ParsedArgs } from './cli'
import { assertDotEnvIsValid } from './configs'
import { LocalFileSystem, Path, RemoteFileSystem } from './modules/file-system'
import { NetworkAddress } from './modules/network'
import { SyncClient } from './modules/sync-client'
import { LocalSyncer, RemoteSyncer, Syncer } from './modules/syncer'


// eslint-disable-next-line @typescript-eslint/consistent-return
function getCliArgsAndExitOnError(): ParsedArgs | undefined {
  try {
    const cli = new Cli()
    return cli.getArgs()
  } catch (error) {
    if (error instanceof ExitExecutionError) {
      process.exit(0)
    }

    if (error instanceof InvalidArgumentError) {
      console.error(error.message)
    } else {
      console.error('An unexpected error occurred:', error)
    }

    process.exit(1)
  }
}


function createLocalSyncer(params: {
  sourcePath: Path
  destinationPath: Path
  exceptions: Path[]
}): Syncer {
  const localFileSystem = new LocalFileSystem()

  return new LocalSyncer({
    source: params.sourcePath,
    destination: params.destinationPath,
    exceptions: params.exceptions,
    fileSystem: localFileSystem,
  })
}


function createRemoteSyncer(params: {
  sourcePath: Path
  destinationPath: Path
  exceptions: Path[]
  destinationAddress: string
  destinationPort: string
}): Syncer {
  const destinationAddress = new NetworkAddress(params.destinationAddress, params.destinationPort)
  const syncClient = new SyncClient(destinationAddress)

  const localFileSystem = new LocalFileSystem()
  const remoteFileSystem = new RemoteFileSystem({ syncClient })

  return new RemoteSyncer({
    source: params.sourcePath,
    destination: params.destinationPath,
    exceptions: params.exceptions,
    localFileSystem,
    remoteFileSystem,
  })
}


async function main() {
  assertDotEnvIsValid()


  try {
    const args = getCliArgsAndExitOnError()
    if (!args) return


    const sourcePath = new Path(args['--source'])
    const destinationPath = new Path(args['--destination'])
    const exceptions = args['--exception'].map(exception => new Path(exception))

    const syncer = args['--destination-address'] && args['--destination-port']
      ? createRemoteSyncer({
          sourcePath: sourcePath,
          destinationPath: destinationPath,
          exceptions,
          destinationAddress: args['--destination-address'],
          destinationPort: args['--destination-port'],
        })
      : createLocalSyncer({
          sourcePath: sourcePath,
          destinationPath: destinationPath,
          exceptions,
        })


    const pathsToConfirm = await syncer.scanDiffs()
    if (!pathsToConfirm) {
      console.log('No path with diffs found on scan')
      process.exit(0)
    }

    if (!args['--skip-confirmation']) {
      const pathsToSync = await syncer.confirmDiffsToSync(pathsToConfirm)
      if (!pathsToSync) {
        console.log('No path with diffs was confirmed to be synced')
        process.exit(0)
      }

      await syncer.syncDiffs(pathsToSync)
    } else {
      await syncer.syncDiffs(pathsToConfirm)
    }
  } catch (error) {
    console.error(error)
  }
}


main()
