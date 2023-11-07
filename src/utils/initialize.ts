import {
  ExtensionContext,
  StatusBarItem,
  WindowState,
  commands,
  window,
} from 'vscode'
import { Store } from './store'
import { log } from './logger'
import { StatusBar } from '../views/statusBar/statusBar'
import { Authorization } from './authorization'
import { StatusBarState } from './types'
import { SpaceUsersApi } from '../api/spaceUsersApi'
import { PullRequestState } from './pullRequestsState'
import { Command } from './commands'
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
  const errorCount = { count: 0 }
  await PullRequestState.update({
    context,
    statusBar,
    isLogin: true,
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

  const spaceUsers = await SpaceUsersApi.get({
    authToken: session?.accessToken ?? '',
    context,
  })
  if (spaceUsers.error || spaceUsers.message) {
    window.showInformationMessage(
      `Error in fetching space users ${spaceUsers.error || spaceUsers.message}`
    )
    commands.executeCommand(Command.signOut)
    return
  }

  await Store.set(context, {
    isFocused: window.state.focused,
    spaceUsers: spaceUsers.spaceUsers,
  })
}
