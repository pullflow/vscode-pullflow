import { ExtensionContext } from 'vscode'
import { ActivePullRequestsApi } from '../api/activePullRequestApi'

export const ActivePullRequests = {
  get: async ({
    accessToken,
    context,
  }: {
    accessToken: string
    context: ExtensionContext
  }) => {
    const activePullRequests = await ActivePullRequestsApi.getCodeReviews({
      accessToken,
      context,
    })
    if (activePullRequests.error || activePullRequests.message)
      return {
        error: activePullRequests.error || activePullRequests.message,
        requireRelogin: !!activePullRequests.message,
      }
    return { data: activePullRequests }
  },
}
