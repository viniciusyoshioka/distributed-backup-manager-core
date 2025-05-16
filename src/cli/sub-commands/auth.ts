import arg, { Handler, Spec } from 'arg'
import dedent from 'dedent'
import process from 'node:process'

import { assertDotEnvIsValid } from '../../env'
import { Cli } from '../cli'
import { CliExitExecutionError, CliInvalidArgumentError } from '../errors'
import { SubCommand } from '../sub-command.interface'
import { getSubCommandArgument } from '../utils'


export interface AuthArgs {
  _: string[]
  '--help': boolean
}


interface AuthArgsSpec extends Spec {
  '--help': Handler
}

const authArgsSpec: AuthArgsSpec = {
  '--help': Boolean,

  '-h': '--help',
}


// TODO: Add arguments, validation and example in the help message
export class AuthSubCommand implements SubCommand<AuthArgs> {


  static readonly SUBCOMMAND_NAME = 'auth'
  private readonly args: AuthArgs


  constructor(argv: string[] = process.argv) {
    assertDotEnvIsValid()

    const subCommandArgument = getSubCommandArgument(argv)
    if (subCommandArgument !== AuthSubCommand.SUBCOMMAND_NAME) {
      throw new CliInvalidArgumentError(`Sub command "${subCommandArgument}" is not valid. Expected "${AuthSubCommand.SUBCOMMAND_NAME}"`)
    }

    this.args = arg(authArgsSpec, { argv }) as AuthArgs
    if (this.args['--help']) {
      this.showHelpAndExit()
    }
    this.validateAndSetDefaultValuesToArgs()
  }


  getSubCommandName(): string {
    return AuthSubCommand.SUBCOMMAND_NAME
  }

  getArgs(): AuthArgs {
    return this.args
  }


  private showHelpAndExit() {
    const helpMessage = dedent(`Usage:

      ${Cli.SHORT_NAME} ${AuthSubCommand.SUBCOMMAND_NAME} [options]

      Options:
        -h, --help                      Show this help message and exit

      Examples:
        ${Cli.SHORT_NAME} ${AuthSubCommand.SUBCOMMAND_NAME}
    `)

    console.log(helpMessage)
    throw new CliExitExecutionError('Help message was shown, the program should exit now')
  }

  private validateAndSetDefaultValuesToArgs() {}
}
