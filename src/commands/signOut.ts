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
    clearFlowInterval: Function
    disposeTextEditorEvent: Function
  }
}) => {
  await context.secrets.store(AppConfig.app.sessionSecret, '')
  await context.secrets.store('userRefreshToken', '')
  await Store.clear(context)
  StatusBar.update({ context, statusBar, state: StatusBarState.SignedOut })
  clearInterval(pollIntervalId) // stopping polling interval
  focusStateEvent.dispose() // removing focus event listener
  presenceInterval.clearFlowInterval() // stopping user flow interval
  presenceInterval.disposeTextEditorEvent() // removing text editor event listener
}
