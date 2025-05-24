import arg, { Handler, Spec } from 'arg'
import dedent from 'dedent'
import process from 'node:process'

import { assertDotEnvIsValid } from '../../env/index.js'
import { Path } from '../../modules/file-system/index.js'
import { IP, NetworkAddress } from '../../modules/network/index.js'
import { Cli } from '../cli.js'
import { CliExitExecutionError, CliInvalidArgumentError } from '../errors/index.js'
import type { SubCommand } from '../sub-command.interface'
import { getSubCommandArgument } from '../utils/index.js'


export interface SyncArgs {
  _: string[]
  '--help': boolean
  '--source': string
  '--destination': string
  '--exception': string[]
  '--source-address': string | null
  '--source-port': string | null
  '--destination-address': string | null
  '--destination-port': string | null
  '--skip-confirmation': boolean
}


interface SyncArgsSpec extends Spec {
  '--help': Handler
  '--source': Handler
  '--destination': Handler
  '--exception': Handler
  '--source-address': Handler
  '--source-port': Handler
  '--destination-address': Handler
  '--destination-port': Handler
  '--skip-confirmation': Handler
}

// TODO: Add exception mode argument
const syncArgsSpec: SyncArgsSpec = {
  '--help': Boolean,
  '--source': String,
  '--destination': String,
  '--exception': [String] as unknown as Handler,
  '--source-address': String,
  '--source-port': String,
  '--destination-address': String,
  '--destination-port': String,
  '--skip-confirmation': Boolean,

  '-h': '--help',
  '-s': '--source',
  '-d': '--destination',
  '-e': '--exception',
  '-c': '--skip-confirmation',
}


export class SyncSubCommand implements SubCommand<SyncArgs> {


  static readonly SUBCOMMAND_NAME = 'sync'
  static readonly SUBCOMMAND_ACTIONS: string[] = []
  private readonly args: SyncArgs

  private readonly cwd = process.cwd()


  constructor(argv: string[] = process.argv) {
    assertDotEnvIsValid()

    const subCommandArgument = getSubCommandArgument(argv)
    if (subCommandArgument !== SyncSubCommand.SUBCOMMAND_NAME) {
      throw new CliInvalidArgumentError(`Sub command "${subCommandArgument}" is not valid. Expected "${SyncSubCommand.SUBCOMMAND_NAME}"`)
    }

    this.args = arg(syncArgsSpec, { argv }) as SyncArgs
    if (this.args['--help']) {
      this.showHelpAndExit()
    }
    this.validateAndSetDefaultValuesToArgs()
  }


  getSubCommandName(): string {
    return SyncSubCommand.SUBCOMMAND_NAME
  }

  getArgs(): SyncArgs {
    return this.args
  }


  private showHelpAndExit() {
    const helpMessage = dedent(`Usage:

      ${Cli.SHORT_NAME} ${SyncSubCommand.SUBCOMMAND_NAME} [options]

      Options:
        -h, --help                      Show this help message and exit
        -s, --source <path>             Path to a folder that will be used as source to sync another folder (the path in --destination) (required)
        -d, --destination <path>        Path to a folder that will be synced with --source (required)
        -e, --exception <path>          Paths to exclude from sync (can be used multiple times; must be a subpath of --source)
        --source-address <ip>           IP address of source machine for remote sync. If not provided, local machine will be used as source. Cannot be used with --destination-address
        --source-port <port>            Port on the source machine to connect for sync. Used with --source-address. Defaults to "${process.env.PORT}"
        --destination-address <ip>      IP address of destination machine for remote sync. If not provided, local machine will be used as destination. Cannot be used with --source-address
        --destination-port <port>       Port on the remote machine to connect for sync. Used with --destination-address. Defaults to "${process.env.PORT}"
        -c, --skip-confirmation         Skip confirmation prompt and sync all differences automatically

      Examples:
        ${Cli.SHORT_NAME} ${SyncSubCommand.SUBCOMMAND_NAME} -s /home/user/src -d /backup/dest                       # Sync local folders
        ${Cli.SHORT_NAME} ${SyncSubCommand.SUBCOMMAND_NAME} -s /home/user/src -d /backup -e node_modules -e .git    # Sync excluding patterns
        ${Cli.SHORT_NAME} ${SyncSubCommand.SUBCOMMAND_NAME} -s /home/user/src -d /backup -a 192.168.1.1 -p 1234 -c  # Remote sync with no confirmation
    `)

    console.log(helpMessage)
    throw new CliExitExecutionError('Help message was shown, the program should exit now')
  }

  private validateAndSetDefaultValuesToArgs() {
    this.parseSource()
    this.parseDestination()
    this.parseExceptions()
    this.parseSourceAddress()
    this.parseSourcePort()
    this.parseDestinationAddress()
    this.parseDestinationPort()
    this.parseSkipConfirmation()
  }

  private parseSource() {
    const sourcePath = this.args['--source'] as string | undefined
    if (!sourcePath) {
      throw new CliInvalidArgumentError('Argument "--source" is required')
    }

    const sourcePathIsAbsolutePath = Path.isAbsolute(sourcePath)
    if (!sourcePathIsAbsolutePath) {
      const absoluteSourcePath = Path.join([this.cwd, sourcePath])
      this.args['--source'] = absoluteSourcePath
      console.log(`Argument "--source" is not an absolute path. Using "${absoluteSourcePath}" instead`)
    }
  }

  private parseDestination() {
    const destinationPath = this.args['--destination'] as string | undefined
    if (!destinationPath) {
      throw new CliInvalidArgumentError('Argument "--destination" is required')
    }

    const destinationPathIsAbsolutePath = Path.isAbsolute(destinationPath)
    if (!destinationPathIsAbsolutePath) {
      const absoluteDestinationPath = Path.join([this.cwd, destinationPath])
      this.args['--destination'] = absoluteDestinationPath
      console.log(`Argument "--destination" is not an absolute path. Using "${absoluteDestinationPath}" instead`)
    }
  }

  private parseExceptions() {
    const exceptionPaths = this.args['--exception'] as string[] | undefined
    if (!exceptionPaths?.length) {
      this.args['--exception'] = []
      return
    }

    const normalizedExceptionPaths = exceptionPaths.map(exceptionPath => {
      const exceptionPathIsAbsolute = Path.isAbsolute(exceptionPath)
      if (exceptionPathIsAbsolute) {
        return exceptionPath
      }

      const absoluteExceptionPath = Path.join([this.cwd, exceptionPath])
      console.log(`A "--exception" argument is not an absolute path. Using "${absoluteExceptionPath}" instead for "${exceptionPath}"`)
      return absoluteExceptionPath
    })

    this.args['--exception'] = normalizedExceptionPaths
  }

  private parseSourceAddress() {
    const sourceAddress = this.args['--source-address'] as string | undefined
    if (!sourceAddress) {
      this.args['--source-address'] = null
      return
    }

    const destinationAddress = this.args['--destination-address'] as string | undefined
    if (destinationAddress) {
      throw new CliInvalidArgumentError('Arguments "--source-address" and "--destination-address" cannot be used together')
    }

    const sourceAddressIsValid = IP.isValid(sourceAddress)
    if (!sourceAddressIsValid) {
      throw new CliInvalidArgumentError(`IP address "${sourceAddress}" for argument "--source-address" is not a valid IP address`)
    }
  }

  private parseSourcePort() {
    const hasSourceAddress = !!this.args['--source-address']
    const sourcePort = this.args['--source-port'] as string | undefined

    if (hasSourceAddress) {
      if (!sourcePort) {
        const defaultPort = process.env.PORT
        if (!defaultPort) {
          throw new CliInvalidArgumentError('No "PORT" variable was found in .env file. This should not happen')
        }

        this.args['--source-port'] = defaultPort
        return
      }

      const sourcePortIsValid = NetworkAddress.isPortValid(sourcePort)
      if (!sourcePortIsValid) {
        throw new CliInvalidArgumentError(`Port "${sourcePort}" for argument "--source-port" is not a valid port`)
      }

      return
    }

    if (sourcePort) {
      console.log(`Argument "--source-port" was given without "--source-address". Ignoring it`)
    }
    this.args['--source-port'] = null
  }

  private parseDestinationAddress() {
    const destinationAddress = this.args['--destination-address'] as string | undefined
    if (!destinationAddress) {
      this.args['--destination-address'] = null
      return
    }

    const sourceAddress = this.args['--source-address'] as string | undefined
    if (sourceAddress) {
      throw new CliInvalidArgumentError('Arguments "--source-address" and "--destination-address" cannot be used together')
    }

    const destinationAddressIsValid = IP.isValid(destinationAddress)
    if (!destinationAddressIsValid) {
      throw new CliInvalidArgumentError(`IP address "${destinationAddress}" for argument "--destination-address" is not a valid IP address`)
    }
  }

  private parseDestinationPort() {
    const hasDestinationAddress = !!this.args['--destination-address']
    const destinationPort = this.args['--destination-port'] as string | undefined

    if (hasDestinationAddress) {
      if (!destinationPort) {
        const defaultPort = process.env.PORT
        if (!defaultPort) {
          throw new CliInvalidArgumentError('No "PORT" variable was found in .env file. This should not happen')
        }

        this.args['--destination-port'] = defaultPort
        return
      }

      const destinationPortIsValid = NetworkAddress.isPortValid(destinationPort)
      if (!destinationPortIsValid) {
        throw new CliInvalidArgumentError(`Port "${destinationPort}" for argument "--destination-port" is not a valid port`)
      }

      return
    }

    if (destinationPort) {
      console.log(`Argument "--destination-port" was given without "--destination-address". Ignoring it`)
    }
    this.args['--destination-port'] = null
  }

  private parseSkipConfirmation() {
    const skipConfirmation = this.args['--skip-confirmation'] as boolean | undefined
    if (typeof skipConfirmation !== 'boolean') {
      this.args['--skip-confirmation'] = false
    }
  }
}
