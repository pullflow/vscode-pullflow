import { ExtensionContext, window } from 'vscode'
import { Authorization } from '../utils/authorization'
import { SpaceUsersApi } from '../api/spaceUsersApi'

export const SpaceUsers = {
  get: async ({
    context,
    codeReviewId,
  }: {
    context: ExtensionContext
    codeReviewId: string
  }) => {
    const session = await Authorization.currentSession(context)
    const response = await SpaceUsersApi.get({
      codeReviewId,
      authToken: session?.accessToken ?? '',
      context,
    })

    if (!response || response.message || response.error) {
      window.showInformationMessage(
        `Failed to fetch space users, please try again.`
      )
      return false
    }

    return response.spaceUsers
  },
}
