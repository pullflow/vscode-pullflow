import { window, ExtensionContext, StatusBarItem } from 'vscode'
import { Store } from '../utils/store'
import { UserPresence } from './userPresence'
import { log } from '../utils/logger'

const USER_FLOW_INTERVAL = 1000 * 60 * 2 // 2 minutes
const module = 'TrackUserFlow.ts'

export const trackUserPresence = (
  context: ExtensionContext,
  statusBar: StatusBarItem
) => {
  log.info(`started tracking user flow`, module)
  const userFlowIntervalId = setInterval(async () => {
    await UserPresence.update(context, statusBar)
  }, USER_FLOW_INTERVAL)
  const textEditorEvent = window.onDidChangeTextEditorSelection(() => {
    incrementKeyStrokeCount(context)
  })

  return { userFlowIntervalId, textEditorEvent }
}

const incrementKeyStrokeCount = (context: ExtensionContext) => {
  const currentKeyStrokeCount = Store.get(context)?.keyStrokeCount
  Store.set(context, {
    keyStrokeCount: currentKeyStrokeCount ? currentKeyStrokeCount + 1 : 1,
    lastKeyStrokeTime: new Date().getTime(),
  })
}
