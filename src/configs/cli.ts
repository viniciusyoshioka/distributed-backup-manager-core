import arg, { Handler, Spec } from 'arg'
import { isIP } from 'node:net'
import path from 'node:path'
import process from 'node:process'


interface ArgsConfig extends Spec {
  '--help': Handler
  '--version': Handler
  '--source': Handler
  '--destination': Handler
  '--exception': Handler
  '--destination-address': Handler
  '--skip-confirmation': Handler
}


export interface ParsedArgs {
  _: string[]
  '--help': boolean
  '--version': boolean
  '--source': string
  '--destination': string
  '--exception': string[]
  '--destination-address': string | null
  '--skip-confirmation': boolean
}


// TODO: Add exception mode argument
const argConfig: ArgsConfig = {
  '--help': Boolean,
  '--version': Boolean,
  '--source': String,
  '--destination': String,
  '--exception': [String] as unknown as Handler,
  '--destination-address': String,
  '--skip-confirmation': Boolean,

  '-h': '--help',
  '-v': '--version',
  '-s': '--source',
  '-d': '--destination',
  '-e': '--exception',
  '-a': '--destination-address',
  '-c': '--skip-confirmation',
}


export class Cli {


  private readonly NAME = 'distributed-backup-manager-core'
  private readonly SHORT_NAME = 'dbmc'
  private readonly VERSION = '0.0.1'
  private readonly args: ParsedArgs

  private readonly cwd = process.cwd()


  constructor(argv?: string[]) {
    this.args = arg(argConfig, { argv }) as ParsedArgs

    if (this.args['--help']) {
      this.showHelpAndExit()
    }
    if (this.args['--version']) {
      this.showVersionAndExit()
    }

    this.validateAndSetDefaultValuesToArgs()
  }


  getArgs(): ParsedArgs {
    return this.args
  }


  private showHelpAndExit() {
    const helpMessage = `Usage: ${this.SHORT_NAME} [options]

    Options:
    -h, --help                      Show this help message
    -v, --version                   Show program version
    -s, --source <path>             Path to a folder that will be used as source to sync another folder (the path in --destination) (required)
    -d, --destination <path>        Path to a folder that will be synced with --source (required)
    -e, --exception <path>          Paths to exclude from sync (can be used multiple times; must be a subpath of --source)
    -a, --destination-address <ip>  IP Address for the machine that will receive the sync. Default is no address, then the sync is local between the two folders. (requires --destination-port)
    -c, --skip-confirmation         Skip confirmation prompt and sync all differences automatically

    Examples:
    ${this.SHORT_NAME} -s /home/user/src -d /backup/dest                       # Sync local folders
    ${this.SHORT_NAME} -s /home/user/src -d /backup -e node_modules -e .git    # Sync excluding patterns
    ${this.SHORT_NAME} -s /home/user/src -d /backup -a 192.168.1.1 -c          # Remote sync with no confirmation
    `

    console.log(helpMessage)
    process.exit(0)
  }

  private showVersionAndExit() {
    const versionMessage = `${this.SHORT_NAME} (${this.NAME}) version: ${this.VERSION}`

    console.log(versionMessage)
    process.exit(0)
  }


  private validateAndSetDefaultValuesToArgs() {
    this.validateSource()
    this.validateDestination()
    this.validateExceptions()
    this.parseDestinationAddress()
    this.validateSkipConfirmation()
  }


  private validateSource() {
    const source = this.args['--source'] as string | undefined
    if (!source) {
      console.log('Param "--source" is required')
      process.exit(0)
    }

    const sourceIsAbsolutePath = path.isAbsolute(source)
    if (!sourceIsAbsolutePath) {
      const absoluteSourcePath = path.join(this.cwd, source)
      this.args['--source'] = absoluteSourcePath
      console.log(`Param "--source" is not an absolute path. Using "${absoluteSourcePath}" instead`)
    }
  }

  private validateDestination() {
    const destination = this.args['--destination'] as string | undefined
    if (!destination) {
      console.log('Param "--destination" is required')
      process.exit(0)
    }

    const destinationIsAbsolutePath = path.isAbsolute(destination)
    if (!destinationIsAbsolutePath) {
      const absoluteDestinationPath = path.join(this.cwd, destination)
      this.args['--destination'] = absoluteDestinationPath
      console.log(`Param "--destination" is not an absolute path. Using "${absoluteDestinationPath}" instead`)
    }
  }

  private isSubpathOf(subPath: string, basePath: string): boolean {
    const subPathIsAbsolute = path.isAbsolute(subPath)
    if (!subPathIsAbsolute) {
      throw new Error(`Subpath "${subPath}" must be an absolute path`)
    }

    const basePathIsAbsolute = path.isAbsolute(basePath)
    if (!basePathIsAbsolute) {
      throw new Error(`Base path "${basePath}" must be an absolute path`)
    }

    const normalizedBasePath = basePath.replace(/(\\|\/)+$/, '')
    return subPath.startsWith(normalizedBasePath)
  }

  private validateExceptionPathIsSubPathOfSource(exceptionPath: string): void {
    const sourcePath = this.args['--source']
    const exceptionPathIsSubPathOfSource = this.isSubpathOf(exceptionPath, sourcePath)
    if (!exceptionPathIsSubPathOfSource) {
      console.log(`Path "${exceptionPath}" from "--exception" param is not a subpath of "--source" ("${sourcePath}")`)
      process.exit(0)
    }
  }

  private validateExceptions() {
    const exceptions = this.args['--exception'] as string[] | undefined
    if (!exceptions?.length) {
      this.args['--exception'] = []
      return
    }

    const normalizedExceptions = exceptions.map(exception => {
      const exceptionIsAbsolute = path.isAbsolute(exception)
      if (exceptionIsAbsolute) {
        this.validateExceptionPathIsSubPathOfSource(exception)
        return exception
      }

      const absoluteExceptionPath = path.join(this.cwd, exception)
      console.log(`A "--exception" param is not an absolute path. Using "${absoluteExceptionPath}" instead for "${exception}"`)

      this.validateExceptionPathIsSubPathOfSource(absoluteExceptionPath)

      return absoluteExceptionPath
    })

    this.args['--exception'] = normalizedExceptions
  }

  // TODO: Check if address is localhost. If so, remove address in favor of local sync
  private parseDestinationAddress() {
    const destinationAddress = this.args['--destination-address'] as string | undefined
    if (!destinationAddress) {
      this.args['--destination-address'] = null
      return
    }

    const destinationAddressIsValid = !!isIP(destinationAddress)
    if (!destinationAddressIsValid) {
      console.log(`IP address "${destinationAddress}" for param "--destination-address" is not a valid IP address`)
      process.exit(0)
    }
  }

  private validateSkipConfirmation() {
    const skipConfirmation = this.args['--skip-confirmation'] as boolean | undefined
    if (typeof skipConfirmation !== 'boolean') {
      const defaultSkipConfirmationValue = false
      this.args['--skip-confirmation'] = defaultSkipConfirmationValue
    }
  }
}
