import { ExtensionContext, StatusBarItem, window } from 'vscode'
import { AppConfig } from '../utils/appConfig'
import { StatusBar } from '../views/statusBar/statusBar'
import { StatusBarState } from '../utils'
import { Store } from '../utils/store'

export const SignOut = async ({
  context,
  statusBar,
  pollIntervalId,
  focusStateEvent,
  presenceInterval,
}: {
  context: ExtensionContext
  statusBar: StatusBarItem
  pollIntervalId: ReturnType<typeof setInterval>
  focusStateEvent: ReturnType<typeof window.onDidChangeWindowState>
  presenceInterval: {
    userFlowIntervalId: ReturnType<typeof setInterval>
    textEditorEvent: ReturnType<typeof window.onDidChangeTextEditorSelection>
  }
}) => {
  await context.secrets.store(AppConfig.app.sessionSecret, '')
  await Store.clear(context)
  StatusBar.update({ context, statusBar, state: StatusBarState.SignedOut })
  clearInterval(pollIntervalId) // stopping polling interval
  clearInterval(presenceInterval.userFlowIntervalId) // stopping user flow interval
  focusStateEvent.dispose() // removing focus event listener
  presenceInterval.textEditorEvent.dispose() // removing text editor event listener
}
