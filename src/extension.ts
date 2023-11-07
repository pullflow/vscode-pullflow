import { ExtensionContext, commands, StatusBarItem, window, Uri } from 'vscode'
import { log } from './utils/logger'
import { SignIn } from './commands/signIn'
import { StatusBar } from './views/statusBar/statusBar'
import { Command } from './utils'
import { initialize } from './utils/initialize'
import { Store } from './utils/store'
import { Reconnect } from './commands/reconnect'
import { SignOut } from './commands/signOut'
import { ActivePullRequests } from './commands/activePullRequests'
import { Authorization } from './utils/authorization'
import { ToggleFlowState } from './commands/toggleFlowState'
import { Welcome } from './views/webviews/welcome/welcome'

const module = 'extension.ts'

export async function activate(context: ExtensionContext) {
  log.info('activating extension', module)

  checkFirstActivation(context)

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
    commands.registerCommand(Command.signIn, () =>
      SignIn({ context, statusBar })
    )
  )
  context.subscriptions.push(
    commands.registerCommand(Command.signOut, () =>
      SignOut({
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
  context.subscriptions.push(
    commands.registerCommand(Command.welcomeView, () => {
      Welcome.show(context)
    })
  )
}

// this method is called when your extension is deactivated
export function deactivate() {}

const checkFirstActivation = (context: ExtensionContext) => {
  const isFirstActivation = !Store.get(context)?.extensionId

  if (isFirstActivation) {
    commands.executeCommand(Command.welcomeView)
    const extensionId = `${context.extension.packageJSON.publisher}.${context.extension.packageJSON.name}`
    Store.set(context, { extensionId })
  }
}
