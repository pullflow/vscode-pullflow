import { window, ExtensionContext, StatusBarItem } from 'vscode'
import { ActivePullRequestsApi } from '../api/activePullRequestApi'
import { Authorization } from '../utils/authorization'
import { Store } from '../utils/store'
import { initialize } from '../utils/initialize'

export const RefreshPullRequests = async (
  context: ExtensionContext,
  statusBar: StatusBarItem
) => {
  const session = await Authorization.currentSession(context)

  const { pendingUserCodeReviews, userAuthoredCodeReviews } = Store.get(context)

  const pendingAuthorXids =
    pendingUserCodeReviews?.map((pr) => pr.author.xid) || []
  const authoredAuthorXids =
    userAuthoredCodeReviews?.map((pr) => pr.author.xid) || []

  const authorXids = [...pendingAuthorXids, ...authoredAuthorXids]

  if (!authorXids.length) return

  const response = await ActivePullRequestsApi.refreshCodeReviews({
    context,
    authorXids,
    accessToken: session?.accessToken,
  })

  if (response?.error || response?.message) {
    window.showInformationMessage(
      `Something went wrong, failed to refresh pull requests.`
    )
    return false
  }
  await initialize({ context, statusBar })
  return true
}
