import { ExtensionContext, StatusBarItem, commands, window } from 'vscode'
import { StatusBar } from '../views/statusBar/statusBar'
import { log } from '../utils/logger'
import { Command, StatusBarState } from '../utils'
import { Authorization } from '../utils/authorization'
import { Store } from '../utils/store'
import { ActivePullRequests } from '../models/activePullRequests'

const module = 'reconnect.ts'

export const Reconnect = async (
  context: ExtensionContext,
  statusBar: StatusBarItem
) => {
  log.info(`reconnecting to PullFlow`, module)

  const session = await Authorization.currentSession(context)
  if (!session) {
    StatusBar.update({ context, statusBar, state: StatusBarState.SignedOut })
    return
  }

  const codeReviews = await ActivePullRequests.get({
    accessToken: session.accessToken,
    context,
  })

  // if codeReviews contain error message
  if (codeReviews.requireRelogin) {
    log.error(codeReviews.error, module)
    window.showInformationMessage(`PullFlow: Please login again`)
    commands.executeCommand(Command.signOut)
    return
  }

  if (codeReviews.error) {
    log.info(`Failed to reconnect`, module)
    StatusBar.update({ context, statusBar, state: StatusBarState.Error })
    return
  }

  log.info(`Reconnected`, module)
  await Store.set(context, {
    pendingUserCodeReviews: codeReviews.data.pending,
    userAuthoredCodeReviews: codeReviews.data.authored,
  })
  StatusBar.update({ context, statusBar, state: StatusBarState.SignedIn })

  commands.executeCommand(Command.activePullRequests)

  return
}
