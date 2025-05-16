import { AuthSubCommand, SyncSubCommand } from '../sub-commands'


export function getSubCommandArgument(argv: string[]): string | undefined {
  const validSubCommands = [
    AuthSubCommand.SUBCOMMAND_NAME,
    SyncSubCommand.SUBCOMMAND_NAME,
  ]

  const argsCountToSkip = 2
  const subCommandIndex = argsCountToSkip
  const subCommand = argv[subCommandIndex]

  return validSubCommands.includes(subCommand) ? subCommand : undefined
}
