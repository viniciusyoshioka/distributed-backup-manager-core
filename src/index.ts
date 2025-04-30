import { Cli, CliExitExecutionError, CliInvalidArgumentError } from './cli'
import { assertDotEnvIsValid, InvalidEnvVariablesError } from './env'
import { LocalFileSystem, Path, RemoteFileSystem } from './modules/file-system'
import { NetworkAddress } from './modules/network'
import { SyncClient } from './modules/sync-client'
import { LocalSyncer, RemoteSyncer, Syncer } from './modules/syncer'


function createLocalSyncer(params: {
  sourcePath: Path
  destinationPath: Path
  exceptions: Path[]
  skipConfirmation: boolean
}): Syncer {
  const localFileSystem = new LocalFileSystem()

  return new LocalSyncer({
    source: params.sourcePath,
    destination: params.destinationPath,
    exceptions: params.exceptions,
    skipConfirmation: params.skipConfirmation,
    fileSystem: localFileSystem,
  })
}


function createRemoteSyncer(params: {
  sourcePath: Path
  destinationPath: Path
  exceptions: Path[]
  skipConfirmation: boolean
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
    skipConfirmation: params.skipConfirmation,
    localFileSystem,
    remoteFileSystem,
  })
}


async function main() {
  try {
    assertDotEnvIsValid()


    const cli = new Cli()
    const args = cli.getArgs()


    const sourcePath = new Path(args['--source'])
    const destinationPath = new Path(args['--destination'])
    const exceptions = args['--exception'].map(exception => new Path(exception))

    const syncer = args['--destination-address'] && args['--destination-port']
      ? createRemoteSyncer({
          sourcePath: sourcePath,
          destinationPath: destinationPath,
          exceptions,
          skipConfirmation: args['--skip-confirmation'],
          destinationAddress: args['--destination-address'],
          destinationPort: args['--destination-port'],
        })
      : createLocalSyncer({
          sourcePath: sourcePath,
          destinationPath: destinationPath,
          exceptions,
          skipConfirmation: args['--skip-confirmation'],
        })


    await syncer.startSync()
  } catch (error) {
    if (error instanceof InvalidEnvVariablesError) {
      console.error(error.message)
      return
    }

    if (error instanceof CliExitExecutionError) {
      return
    }
    if (error instanceof CliInvalidArgumentError) {
      console.error(error.message)
      return
    }


    console.error(error)
  }
}


main()
