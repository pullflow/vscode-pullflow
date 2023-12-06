import { ExtensionContext, StatusBarItem, window, commands } from 'vscode'
import { Authorization } from './authorization'
import { StatusBar } from '../views/statusBar/statusBar'
import { StatusBarState } from './types'
import { ActivePullRequests } from '../models/activePullRequests'
import { Store } from './store'
import { Command } from './commands'
import { log } from './logger'

const MAX_ERROR_COUNT = 3
const module = 'pullRequestState.ts'

export const PullRequestState = {
  update: async ({
    context,
    statusBar,
    isLogin = false,
    errorCount,
  }: {
    context: ExtensionContext
    statusBar: StatusBarItem
    isLogin?: boolean
    errorCount: { count: number }
  }) => {
    const session = await Authorization.currentSession(context)
    if (!session) {
      StatusBar.update({ context, statusBar, state: StatusBarState.SignedOut })
      return
    }
    if (isLogin)
      StatusBar.update({ context, statusBar, state: StatusBarState.Loading })

    log.info(
      `updating pull requests for ${JSON.stringify(session.account)}`,
      module
    )
    const codeReviews = await ActivePullRequests.get({
      accessToken: session.accessToken,
      context,
    })

    // if codeReviews contain error message
    if (codeReviews.requireRelogin) {
      log.error(codeReviews.error, module)
      window.showInformationMessage(`Pullflow: Please login again`)
      commands.executeCommand(Command.signOut)
      return
    }

    if (codeReviews.error) {
      errorCount.count = codeReviews.error ? errorCount.count + 1 : 0
      if (errorCount.count >= MAX_ERROR_COUNT) {
        StatusBar.update({ context, statusBar, state: StatusBarState.Error })
      }
      window.showErrorMessage(
        `Pullflow: Couldn't fetch pull requests. ${codeReviews.error.message}`
      )
      return
    }
    await Store.set(context, {
      pendingUserCodeReviews: codeReviews.data?.pending,
      userAuthoredCodeReviews: codeReviews.data?.authored,
      isFocused: window.state.focused,
      ...(window.state.focused
        ? { lastFocusedTime: new Date().getTime() }
        : { lastFocusedTime: null }),
    })
    StatusBar.update({ context, statusBar, state: StatusBarState.SignedIn })
  },
}
