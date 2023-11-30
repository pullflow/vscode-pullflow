import {
  ExtensionContext,
  ThemeColor,
  StatusBarItem,
  window,
  StatusBarAlignment,
} from 'vscode'

import { Command, PresenceStatus, StatusBarState } from '../../utils'
import { Theme } from '../../utils/theme'
import { log } from '../../utils/logger'
import { Authorization } from '../../utils/authorization'
import { Store } from '../../utils/store'
import { PullRequestIcons, IconReference } from '../../utils/pullRequestIcons'

const STATUS_BAR_ALIGNMENT = 100
const MAX_PR_COUNT = 4
const module = 'status_bar.ts'
const STATUS_BAR_ICON_PREVIEW = false

const statusBarProperties = {
  signedIn: {
    command: Command.activePullRequests,
    backgroundColor: new ThemeColor(Theme.statusBar.success),
    text: '',
    tooltip: 'Pullflow - Active Pull Requests',
  },
  signedOut: {
    command: Command.signIn,
    backgroundColor: new ThemeColor(Theme.statusBar.error),
    text: '⚠ Sign in to Pullflow',
    tooltip: 'Sign in to Pullflow account',
  },
  loading: {
    command: null,
    backgroundColor: new ThemeColor(Theme.statusBar.success),
    text: '$(sync~spin) $(pullflow-icon) $(sync~spin)',
    tooltip: '',
  },
  error: {
    command: Command.reconnect,
    text: '$(pullflow-icon) Offline',
    tooltip: 'Reconnect',
  },
}

export const StatusBar = {
  activate: async (context: ExtensionContext) => {
    const statusBar: StatusBarItem = window.createStatusBarItem(
      StatusBarAlignment.Right,
      STATUS_BAR_ALIGNMENT
    )
    const session = await Authorization.currentSession(context)
    const state = session ? StatusBarState.SignedIn : StatusBarState.SignedOut
    StatusBar.update({ context, statusBar, state })
    return statusBar
  },

  update: ({
    context,
    statusBar,
    state,
  }: {
    context: ExtensionContext
    statusBar: StatusBarItem
    state: StatusBarState
  }) => {
    log.info('updating status bar', module)

    if (state === StatusBarState.SignedIn) {
      statusBarProperties.signedIn.text = getStatusBarText({ context })
      statusBar = Object.assign(statusBar, statusBarProperties.signedIn)
    } else if (state === StatusBarState.Loading) {
      statusBar = Object.assign(statusBar, statusBarProperties.loading)
    } else if (state === StatusBarState.Error) {
      statusBarProperties.error.text = getStatusBarText({
        context,
        showErrorIcon: true,
      })
      statusBar = Object.assign(statusBar, statusBarProperties.error)
    } else {
      statusBar = Object.assign(statusBar, statusBarProperties.signedOut)
    }
    statusBar.show()
  },
}

/** computes status bar text */
function getStatusBarText({
  context,
  showErrorIcon = false,
}: {
  context: ExtensionContext
  showErrorIcon?: boolean
}): string {
  if (STATUS_BAR_ICON_PREVIEW) {
    const allIcons = IconReference.map((k) => `$(${k})`).join('')
    return '$(pullflow-icon)' + allIcons
  }
  const {
    pendingUserCodeReviews,
    userAuthoredCodeReviews,
    previousPresenceStatus,
  } = Store.get(context)

  const presenceIcon =
    previousPresenceStatus === PresenceStatus.Flow ? '$(flow-state-icon)' : ''
  const errorIcon = showErrorIcon ? '  $(warning)  ' : ''

  if (!pendingUserCodeReviews && !userAuthoredCodeReviews)
    return `${errorIcon} ${presenceIcon} $(pullflow-icon)`

  const pendingCodeReviewsCount = pendingUserCodeReviews?.length || 0
  const authoredCodeReviewsCount = userAuthoredCodeReviews?.length || 0
  if (
    pendingCodeReviewsCount < MAX_PR_COUNT &&
    authoredCodeReviewsCount < MAX_PR_COUNT
  ) {
    const pendingCodeReviewIcons =
      pendingUserCodeReviews?.map(
        (codeReview) => `$(${PullRequestIcons.getIcon(codeReview.botReaction)})`
      ) || []
    const authoredCodeReviewIcons =
      userAuthoredCodeReviews?.map(
        (codeReview) => `$(${PullRequestIcons.getIcon(codeReview.botReaction)})`
      ) || []
    return `${errorIcon} ${presenceIcon} ${pendingCodeReviewIcons.join(
      ''
    )} $(pullflow-icon) ${authoredCodeReviewIcons.join('')}`
  } else {
    return `${errorIcon} ${presenceIcon} ${pendingCodeReviewsCount} $(pullflow-icon) ${authoredCodeReviewsCount}`
  }
}
