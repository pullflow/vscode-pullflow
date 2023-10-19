import { ExtensionContext, commands, StatusBarItem, window, Uri } from 'vscode'
import { log } from './utils/logger'
import { Login } from './commands/login'
import { StatusBar } from './views/statusBar/statusBar'
import { Command } from './utils'
import { initialize } from './utils/initialize'
import { Store } from './utils/store'
import { Reconnect } from './commands/reconnect'
import { Logout } from './commands/logout'
import { ActivePullRequests } from './commands/activePullRequests'
import { Authorization } from './utils/authorization'
import { ToggleFlowState } from './commands/toggleFlowState'

const module = 'extension.ts'

export async function activate(context: ExtensionContext) {
  log.info('activating extension', module)

  await checkSessionAndLogin(context)
  const statusBar: StatusBarItem = await StatusBar.activate(context)
  const { pollIntervalId, focusStateEvent, presenceInterval } =
    await initialize({
      context,
      statusBar,
    })

  window.registerUriHandler({
    async handleUri(uri: Uri) {
      const query = new URLSearchParams(uri.query)
      const user = {
        username: query.get('username') as string,
        authToken: query.get('accessToken') as string,
      }
      await Store.set(context, {
        user,
      })
      if (user.authToken) {
        await Authorization.createSession({ user, context })
        await initialize({ context, statusBar })
      }
    },
  })

  context.subscriptions.push(
    commands.registerCommand(Command.login, () => Login({ context, statusBar }))
  )
  context.subscriptions.push(
    commands.registerCommand(Command.logout, () =>
      Logout({
        context,
        statusBar,
        pollIntervalId,
        focusStateEvent,
        presenceInterval,
      })
    )
  )
  context.subscriptions.push(
    commands.registerCommand(Command.reconnect, () =>
      Reconnect(context, statusBar)
    )
  )
  context.subscriptions.push(
    commands.registerCommand(Command.activePullRequests, () =>
      ActivePullRequests(context, statusBar)
    )
  )
  context.subscriptions.push(
    commands.registerCommand(Command.toggleFlowState, () =>
      ToggleFlowState(context, statusBar)
    )
  )
}

// this method is called when your extension is deactivated
export function deactivate() {}

const checkSessionAndLogin = async (context: ExtensionContext) => {
  const session = await Authorization.currentSession(context)
  if (!session) {
    window.showInformationMessage(
      `Pullflow: Please login to continue using extension`
    )
    commands.executeCommand(Command.login)
  }
}
