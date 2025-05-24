import arg, { Handler, Spec } from 'arg'
import { isEmail, isStrongPassword } from 'class-validator'
import dedent from 'dedent'
import process from 'node:process'

import { assertDotEnvIsValid } from '../../env/index.js'
import { IP, NetworkAddress } from '../../modules/network/index.js'
import { Cli } from '../cli.js'
import { CliExitExecutionError, CliInvalidArgumentError } from '../errors/index.js'
import type { SubCommand } from '../sub-command.interface.js'
import { getSubCommandAction, getSubCommandArgument } from '../utils/index.js'


export enum AuthSubCommandAction {
  REGISTER = 'register',
  LOGIN = 'login',
}


// AuthSubCommand default args
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


// AuthSubCommand with register action args
export interface AuthRegisterUserArgs {
  _: string[]
  '--help': boolean
  '--name': string
  '--email': string
  '--password': string
  '--machine-address': string
  '--machine-port': string
}

interface AuthRegisterUserArgsSpec extends Spec {
  '--help': Handler
  '--name': Handler
  '--email': Handler
  '--password': Handler
  '--machine-address': Handler
  '--machine-port': Handler
}

const authRegisterUserArgsSpec: AuthRegisterUserArgsSpec = {
  '--help': Boolean,
  '--name': String,
  '--email': String,
  '--password': String,
  '--machine-address': String,
  '--machine-port': String,

  '-h': '--help',
  '-n': '--name',
  '-e': '--email',
  '-w': '--password',
  '-a': '--machine-address',
  '-p': '--machine-port',
}


// AuthSubCommand with login action args
export interface AuthLoginUserArgs {
  _: string[]
  '--help': boolean
  '--email': string
  '--password': string
  '--machine-address': string
  '--machine-port': string
}

interface AuthLoginUserArgsSpec extends Spec {
  '--help': Handler
  '--email': Handler
  '--password': Handler
  '--machine-address': Handler
  '--machine-port': Handler
}

const authLoginUserArgsSpec: AuthLoginUserArgsSpec = {
  '--help': Boolean,
  '--email': String,
  '--password': String,
  '--machine-address': String,
  '--machine-port': String,

  '-h': '--help',
  '-e': '--email',
  '-w': '--password',
  '-a': '--machine-address',
  '-p': '--machine-port',
}


// TODO: Remove code duplication in address and port validation
export class AuthSubCommand implements SubCommand<
  AuthArgs | AuthRegisterUserArgs | AuthLoginUserArgs
> {


  static readonly SUBCOMMAND_NAME = 'auth'
  static readonly SUBCOMMAND_ACTIONS = [
    AuthSubCommandAction.REGISTER,
    AuthSubCommandAction.LOGIN,
  ]

  private readonly argv: string[]
  private readonly args: AuthArgs | AuthRegisterUserArgs | AuthLoginUserArgs
  private readonly subCommandName: string
  private readonly subCommandAction: AuthSubCommandAction | undefined


  constructor(argv: string[] = process.argv) {
    assertDotEnvIsValid()

    this.argv = argv

    const subCommandArgument = getSubCommandArgument(argv)
    if (subCommandArgument !== AuthSubCommand.SUBCOMMAND_NAME) {
      throw new CliInvalidArgumentError(`Sub command "${subCommandArgument}" is not valid. Expected "${AuthSubCommand.SUBCOMMAND_NAME}"`)
    }
    this.subCommandName = subCommandArgument

    const subCommandAction = getSubCommandAction(argv) as AuthSubCommandAction | null | undefined
    if (subCommandAction === null) {
      throw new CliInvalidArgumentError(`Sub command action "${subCommandAction}" is not valid. Expected one of ${AuthSubCommand.SUBCOMMAND_ACTIONS.join(', ')}`)
    }
    this.subCommandAction = subCommandAction

    this.args = this.parseArgsBasedOnSubCommandAction()

    if (!this.subCommandAction || this.args['--help']) {
      this.showHelpAndExit()
    }
    this.validateAndSetDefaultValuesToArgs()
  }


  getSubCommandName(): string {
    return this.subCommandName
  }

  getArgs(): AuthArgs | AuthRegisterUserArgs | AuthLoginUserArgs {
    return this.args
  }


  private parseArgsBasedOnSubCommandAction(): AuthArgs | AuthRegisterUserArgs | AuthLoginUserArgs {
    if (!this.subCommandAction) {
      return arg(authArgsSpec, { argv: this.argv }) as AuthArgs
    }

    switch (this.subCommandAction) {
      case AuthSubCommandAction.REGISTER:
        return arg(authRegisterUserArgsSpec, { argv: this.argv }) as AuthRegisterUserArgs
      case AuthSubCommandAction.LOGIN:
        return arg(authLoginUserArgsSpec, { argv: this.argv }) as AuthLoginUserArgs
      default:
        throw new CliInvalidArgumentError(`Sub command action "${String(this.subCommandAction)}" is not valid. Expected one of ${AuthSubCommand.SUBCOMMAND_ACTIONS.join(', ')}`)
    }
  }

  private showHelpAndExit() {
    const helpMessage = dedent(`Usage:

      ${Cli.SHORT_NAME} ${AuthSubCommand.SUBCOMMAND_NAME} [options]
      ${Cli.SHORT_NAME} ${AuthSubCommand.SUBCOMMAND_NAME} <action> [options]

      Options:
        -h, --help                        Show this help message and exit

      Actions:
        ${AuthSubCommandAction.REGISTER}  Register a new user on specific remote machine
        ${AuthSubCommandAction.LOGIN}     Login an existing user on specific remote machine

      Options for ${AuthSubCommandAction.REGISTER} action:
        -h, --help                        Show this help message and exit
        -n, --name <name>                 User name
        -e, --email <email>               User email
        -w, --password <password>         User password
        -a, --machine-address <address>   Remote machine address
        -p, --machine-port <port>         Remote machine port

      Options for ${AuthSubCommandAction.LOGIN} action:
        -h, --help                        Show this help message and exit
        -e, --email <email>               User email
        -w, --password <password>         User password
        -a, --machine-address <address>   Remote machine address
        -p, --machine-port <port>         Remote machine port

      Examples:
        ${Cli.SHORT_NAME} ${AuthSubCommand.SUBCOMMAND_NAME} ${AuthSubCommandAction.REGISTER} -n "The user name" -e "user@domain.com" --w "rj#TK5PfLs" -a 192.168.1.10 -p 8080
        ${Cli.SHORT_NAME} ${AuthSubCommand.SUBCOMMAND_NAME} ${AuthSubCommandAction.LOGIN} --email "user@domain.com" --password "$VfBw!ePs0" -a 192.168.1.10
    `)

    console.log(helpMessage)
    throw new CliExitExecutionError('Help message was shown, the program should exit now')
  }

  private validateAndSetDefaultValuesToArgs() {
    if (!this.subCommandAction) {
      return
    }

    switch (this.subCommandAction) {
      case AuthSubCommandAction.REGISTER:
        this.validateAndSetDefaultValuesToRegisterUserArgs()
        break
      case AuthSubCommandAction.LOGIN:
        this.validateAndSetDefaultValuesToLoginUserArgs()
        break
    }
  }


  private validateAndSetDefaultValuesToRegisterUserArgs() {
    this.parseName()
    this.parseEmail()
    this.parsePassword()
    this.parseMachineAddress()
    this.parseMachinePort()
  }

  private parseName() {
    const args = this.args as AuthRegisterUserArgs

    const name = args['--name'] as string | undefined
    if (!name) {
      throw new CliInvalidArgumentError('Argument "--name" is required')
    }

    if (name.length < 3) {
      throw new CliInvalidArgumentError('Argument "--name" must be at least 3 characters long')
    }
  }

  private parseEmail() {
    const args = this.args as AuthRegisterUserArgs | AuthLoginUserArgs

    const email = args['--email'] as string | undefined
    if (!email) {
      throw new CliInvalidArgumentError('Argument "--email" is required')
    }

    const emailAddressIsValid = isEmail(email)
    if (!emailAddressIsValid) {
      throw new CliInvalidArgumentError('Argument "--email" must be a valid email address')
    }
  }

  private parsePassword() {
    const args = this.args as AuthRegisterUserArgs | AuthLoginUserArgs

    const password = args['--password'] as string | undefined
    if (!password) {
      throw new CliInvalidArgumentError('Argument "--password" is required')
    }

    const passwordIsStrong = isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    if (!passwordIsStrong) {
      throw new CliInvalidArgumentError('Argument "--password" must be a strong password. A strong password must be at least 8 characters long, contain at least 1 lowercase letter, 1 uppercase letter, 1 number and 1 symbol')
    }
  }

  private parseMachineAddress() {
    const args = this.args as AuthRegisterUserArgs | AuthLoginUserArgs

    const machineAddress = args['--machine-address'] as string | undefined
    if (!machineAddress) {
      throw new CliInvalidArgumentError('Argument "--machine-address" is required')
    }

    const machineAddressIsValid = IP.isValid(machineAddress)
    if (!machineAddressIsValid) {
      throw new CliInvalidArgumentError(`IP address "${machineAddress}" for argument "--machine-address" is not a valid IP address`)
    }
  }

  private parseMachinePort() {
    const args = this.args as AuthRegisterUserArgs | AuthLoginUserArgs

    const machinePort = args['--machine-port'] as string | undefined
    if (!machinePort) {
      const defaultPort = process.env.PORT
      if (!defaultPort) {
        throw new CliInvalidArgumentError('No "PORT" variable was found in .env file. This should not happen')
      }

      args['--machine-port'] = defaultPort
      return
    }

    const machinePortIsValid = NetworkAddress.isPortValid(machinePort)
    if (!machinePortIsValid) {
      throw new CliInvalidArgumentError(`Port "${machinePort}" for argument "--machine-port" is not a valid port`)
    }
    args['--machine-port'] = machinePort
  }


  private validateAndSetDefaultValuesToLoginUserArgs() {
    this.parseEmail()
    this.parsePassword()
    this.parseMachineAddress()
    this.parseMachinePort()
  }
}
