import arg, { Handler, Spec } from 'arg'
import dedent from 'dedent'
import process from 'node:process'

import { assertDotEnvIsValid } from '../env'
import { CliExitExecutionError, CliInvalidArgumentError } from './errors'
import { SubCommand } from './sub-command.interface'
import { AuthSubCommand, SyncSubCommand } from './sub-commands'
import { getSubCommandArgument } from './utils'


export interface CliArgs {
  _: string[]
  '--help': boolean
  '--version': boolean
}


interface CliArgsSpec extends Spec {
  '--help': Handler
  '--version': Handler
}

const cliArgsSpec: CliArgsSpec = {
  '--help': Boolean,
  '--version': Boolean,

  '-h': '--help',
  '-v': '--version',
}


export class Cli {


  static readonly NAME = 'distributed-backup-manager-core'
  static readonly SHORT_NAME = 'dbmc'
  static readonly VERSION = '0.0.1'

  private readonly argv: string[]
  private args: CliArgs | null = null

  private subCommand: SubCommand | null = null
  private subCommandArgs: object | null = null


  constructor(argv: string[] = process.argv) {
    assertDotEnvIsValid()

    this.argv = argv
    this.parseArgs()
  }


  getArgs(): CliArgs | null {
    return this.args
  }

  getSubCommandName(): string | null {
    return this.subCommand ? this.subCommand.getSubCommandName() : null
  }

  getSubCommandArgs(): object | null {
    return this.subCommandArgs
  }


  private parseArgs() {
    const subCommandArgument = getSubCommandArgument(this.argv)
    if (!subCommandArgument) {
      this.args = arg(cliArgsSpec, { argv: this.argv }) as CliArgs
      this.parseCliOptions()
      return
    }

    this.subCommand = this.createSubCommand(subCommandArgument)
    this.subCommandArgs = this.subCommand.getArgs()
  }

  private parseCliOptions() {
    if (!this.args) return

    if (this.args['--help']) {
      this.showHelpAndExit()
    }
    if (this.args['--version']) {
      this.showVersionAndExit()
    }

    // No sub command or option was provided
    this.showHelpAndExit()
  }

  private showHelpAndExit() {
    const helpMessage = dedent(`Usage:

      ${Cli.SHORT_NAME} [options]
      ${Cli.SHORT_NAME} <subcommand> [options]

      Options:
        -h, --help      Show this help message and exit
        -v, --version   Show program version and exit

      Subcommands:
        auth            Manage authentication operations between machines
        sync            Perform synchronization operations between local and remote directories

      Run '${Cli.SHORT_NAME} <subcommand> --help' for specific subcommand options
    `)

    console.log(helpMessage)
    throw new CliExitExecutionError('Help message was shown, the program should exit now')
  }

  private showVersionAndExit() {
    const versionMessage = `${Cli.SHORT_NAME} (${Cli.NAME}) version: ${Cli.VERSION}`

    console.log(versionMessage)
    throw new CliExitExecutionError('Version was shown, the program should exit now')
  }

  private createSubCommand(subCommandArgument: string): SubCommand {
    switch (subCommandArgument) {
      case AuthSubCommand.SUBCOMMAND_NAME:
        return new AuthSubCommand(this.argv)
      case SyncSubCommand.SUBCOMMAND_NAME:
        return new SyncSubCommand(this.argv)
      default:
        throw new CliInvalidArgumentError(`"${subCommandArgument}" is not a valid sub command`)
    }
  }
}
