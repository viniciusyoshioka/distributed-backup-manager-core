import { AuthSubCommand, SyncSubCommand } from '../sub-commands/index.js'


/**
 * @returns
 * - `string` if the sub-command action is provided and valid
 * - `null` if the sub-command action is provided but invalid
 * - `undefined` if the sub-command action is not provided
 */
export function getSubCommandAction(argv: string[]): string | null | undefined {
  const validSubCommandActions = [
    ...AuthSubCommand.SUBCOMMAND_ACTIONS,
    ...SyncSubCommand.SUBCOMMAND_ACTIONS,
  ]

  // 2 for the command and 1 for the sub-command
  const argsCountToSkip = 2 + 1
  const subCommandActionIndex = argsCountToSkip
  const subCommandAction = argv[subCommandActionIndex] as string | undefined

  if (subCommandAction === undefined) {
    return undefined
  }

  const subCommandActionIsValid = validSubCommandActions.includes(subCommandAction)
  if (subCommandActionIsValid) {
    return subCommandAction
  }

  const canIgnoreItem = subCommandAction.startsWith('-') || subCommandAction.startsWith('--')
  if (!canIgnoreItem) {
    return null
  }
  return undefined
}
