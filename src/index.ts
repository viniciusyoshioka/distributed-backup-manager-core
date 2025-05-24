import {
  AuthArgs,
  AuthLoginUserArgs,
  AuthRegisterUserArgs,
  AuthSubCommand,
  AuthSubCommandAction,
  Cli,
  CliExitExecutionError,
  CliInvalidArgumentError,
  getSubCommandAction,
  SyncArgs,
  SyncSubCommand,
} from './cli/index.js'
import { assertDotEnvIsValid, InvalidEnvVariablesError } from './env/index.js'
import { LocalFileSystem, Path, RemoteFileSystem } from './modules/file-system/index.js'
import { NetworkAddress } from './modules/network/index.js'
import { SyncClient } from './modules/sync-client/index.js'
import { LocalSyncer, RemoteSyncer, Syncer } from './modules/syncer/index.js'


async function registerUser(args: AuthRegisterUserArgs) {
  try {
    const machineAddress = args['--machine-address']
    const machinePort = args['--machine-port']
    const machineNetworkAddress = new NetworkAddress(machineAddress, machinePort)
    const syncClient = new SyncClient(machineNetworkAddress)

    await syncClient.user.createUser({
      name: args['--name'],
      email: args['--email'],
      password: args['--password'],
    })

    console.log('User created successfully')
  } catch (error) {
    console.error('Error creating user.', error)
  }
}

async function loginUser(args: AuthLoginUserArgs) {
  try {
    const machineAddress = args['--machine-address']
    const machinePort = args['--machine-port']
    const machineNetworkAddress = new NetworkAddress(machineAddress, machinePort)
    const syncClient = new SyncClient(machineNetworkAddress)

    const { token } = await syncClient.user.loginUser({
      email: args['--email'],
      password: args['--password'],
    })

    console.log(`User logged in successfully. Token: ${token}`)
  } catch (error) {
    console.error('Error logging in user.', error)
  }
}

// TODO: Improve how Cli and SubCommands handle subCommands and actions
async function auth(args: AuthArgs | AuthRegisterUserArgs | AuthLoginUserArgs) {
  const subCommandAction = getSubCommandAction(args['_']) as AuthSubCommandAction
  switch (subCommandAction) {
    case AuthSubCommandAction.REGISTER:
      await registerUser(args as AuthRegisterUserArgs)
      break
    case AuthSubCommandAction.LOGIN:
      await loginUser(args as AuthLoginUserArgs)
      break
  }
}


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
