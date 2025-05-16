import {
  AuthArgs,
  AuthSubCommand,
  Cli,
  CliExitExecutionError,
  CliInvalidArgumentError,
  SyncArgs,
  SyncSubCommand,
} from './cli'
import { assertDotEnvIsValid, InvalidEnvVariablesError } from './env'
import { LocalFileSystem, Path, RemoteFileSystem } from './modules/file-system'
import { NetworkAddress } from './modules/network'
import { SyncClient } from './modules/sync-client'
import { LocalSyncer, RemoteSyncer, Syncer } from './modules/syncer'


async function auth(args: AuthArgs) {}


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

async function sync(args: SyncArgs) {
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
}


async function main() {
  try {
    assertDotEnvIsValid()

    const cli = new Cli()
    const subCommand = cli.getSubCommandName()
    const args = cli.getSubCommandArgs()

    switch (subCommand) {
      case AuthSubCommand.SUBCOMMAND_NAME:
        await auth(args as AuthArgs)
        return
      case SyncSubCommand.SUBCOMMAND_NAME:
        await sync(args as SyncArgs)
        return
      default:
        throw new CliInvalidArgumentError(`Invalid subcommand: ${subCommand}`)
    }
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
