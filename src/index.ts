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
import { LocalFileSystem, Path, RelativePath, RemoteFileSystem } from './modules/file-system/index.js'
import { NetworkAddress } from './modules/network/index.js'
import { SyncClient } from './modules/sync-client/index.js'
import { Syncer } from './modules/syncer/index.js'


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


async function sync(args: SyncArgs) {
  const sourcePath = Path.isAbsolute(args['--source'])
    ? new Path(args['--source'])
    : new RelativePath(args['--source'])
  const destinationPath = Path.isAbsolute(args['--destination'])
    ? new Path(args['--destination'])
    : new RelativePath(args['--destination'])
  const exceptions = args['--exception'].map(exception => {
    return new RelativePath(exception)
  })


  const sourceAddress = (args['--source-address'] && args['--source-port'])
    ? new NetworkAddress(args['--source-address'], args['--source-port'])
    : null
  const destinationAddress = (args['--destination-address'] && args['--destination-port'])
    ? new NetworkAddress(args['--destination-address'], args['--destination-port'])
    : null
  if (sourceAddress && destinationAddress) {
    throw new Error('Both source and destination addresses cannot be provided at the same time')
  }

  const localFileSystem = new LocalFileSystem()
  const sourceFileSystem = sourceAddress
    ? new RemoteFileSystem({
      syncClient: new SyncClient(sourceAddress),
      localFileSystem,
    })
    : localFileSystem
  const destinationFileSystem = destinationAddress
    ? new RemoteFileSystem({
      syncClient: new SyncClient(destinationAddress),
      localFileSystem,
    })
    : localFileSystem


  const syncer = new Syncer({
    source: sourcePath,
    destination: destinationPath,
    exceptions,
    skipConfirmation: args['--skip-confirmation'],
    sourceFileSystem,
    destinationFileSystem,
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
