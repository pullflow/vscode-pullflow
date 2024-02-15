import {
  ExtensionContext,
  StatusBarItem,
  WindowState,
  window,
  workspace,
} from 'vscode'
import { Store } from './store'
import { log } from './logger'
import { StatusBar } from '../views/statusBar/statusBar'
import { Authorization } from './authorization'
import { StatusBarState } from './types'
import { PullRequestState } from './pullRequestsState'
import { trackUserPresence } from '../userPresence/trackUserPresence'

const POLLING_TIME = 60000 // in ms
const module = 'initialize.ts'

/** this function sets current state of cache and status bar on installing extension*/
export const initialize = async ({
  context,
  statusBar,
}: {
  context: ExtensionContext
  statusBar: StatusBarItem
}) => {
  log.info('initializing extension', module)

  await initializeConfiguration(context)

  const errorCount = { count: 0 }
  await PullRequestState.update({
    context,
    statusBar,
    showLoading: true,
    errorCount,
  })
  await setSpaceUsers({ context, statusBar })
  const pollIntervalId = setInterval(async () => {
    if (window.state.focused) {
      await PullRequestState.update({ context, statusBar, errorCount })
    }
  }, POLLING_TIME)

  // update cache when focus state changes
  const focusStateEvent = window.onDidChangeWindowState(async (e) => {
    await handleWindowState({ state: e, context, statusBar, errorCount })
  })

  const presenceInterval = trackUserPresence(context, statusBar)

  return { pollIntervalId, focusStateEvent, presenceInterval }
}

const handleWindowState = async ({
  state,
  context,
  statusBar,
  errorCount,
}: {
  state: WindowState
  context: ExtensionContext
  statusBar: StatusBarItem
  errorCount: { count: number }
}) => {
  log.info('window state changed', module)

  const wasFocused = Store.get(context)?.isFocused
  if (state.focused && !wasFocused) {
    log.info('updating pull request data', module)

    await PullRequestState.update({
      context,
      statusBar,
      errorCount,
    })
  }
  await Store.set(context, {
    isFocused: state.focused,
    keyStrokeCount: 0,
    lastKeyStrokeTime: null,
    ...(state.focused
      ? { lastFocusedTime: new Date().getTime() }
      : {
          lastFocusedTime: null,
        }),
  })
}

const setSpaceUsers = async ({
  context,
  statusBar,
}: {
  context: ExtensionContext
  statusBar: StatusBarItem
}) => {
  const session = await Authorization.currentSession(context)
  if (!session) {
    StatusBar.update({ context, statusBar, state: StatusBarState.SignedOut })
    return
  }

  await Store.set(context, {
    isFocused: window.state.focused,
  })
}

const extensionTelemetryFlag = () =>
  getPullflowConfig('telemetry.enabled', true)

const vscodeTelemetryFlag = () =>
  workspace.getConfiguration('telemetry').get<boolean>('enableTelemetry')

const initializeConfiguration = async (context: ExtensionContext) => {
  await Store.set(context, {
    isTelemetryEnabled: vscodeTelemetryFlag() && extensionTelemetryFlag(),
    isFlowDetectionEnabled: !!getPullflowConfig(
      'automaticFlowDetection.enabled'
    ),
  })

  const disposable = workspace.onDidChangeConfiguration(async (event) => {
    if (
      event.affectsConfiguration('telemetry.enableTelemetry') ||
      event.affectsConfiguration('pullflow.telemetry.enabled')
    ) {
      await Store.set(context, {
        isTelemetryEnabled: vscodeTelemetryFlag() && extensionTelemetryFlag(),
      })
    }

    if (event.affectsConfiguration('pullflow.automaticFlowDetection.enabled')) {
      await Store.set(context, {
        isFlowDetectionEnabled: !!getPullflowConfig(
          'automaticFlowDetection.enabled'
        ),
      })
    }
  })
  context.subscriptions.push(disposable)
}

const getPullflowConfig = (key: string, defaultValue?: boolean) => {
  const config = workspace.getConfiguration('pullflow')
  const value = config.get<boolean>(key)
  return value ?? defaultValue
}
