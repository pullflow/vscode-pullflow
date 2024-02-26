import { log } from '../utils/logger'
import { ExtensionContext } from 'vscode'
import { PullflowApi } from '../utils/pullflowApi'

const module = 'spaceUsersApi.ts'

const SPACE_USERS_QUERY = `query spaceUsersForVscode($codeReviewId: String!) {
	spaceUsersForVscode(codeReviewId: $codeReviewId) {
    message
    spaceUsers {
		  name
		  codeXid
    }
	}
}
`
export const SpaceUsersApi = {
  get: async ({
    authToken,
    codeReviewId,
    context,
  }: {
    authToken: string
    codeReviewId: string
    context: ExtensionContext
  }) => {
    log.info(`fetching space users`, module)

    const pullflowApi = new PullflowApi(context, authToken)
    try {
      const data = await pullflowApi.fetch(SPACE_USERS_QUERY, { codeReviewId })
      return data.spaceUsersForVscode
    } catch (e) {
      log.error(`error in fetching space users, ${e}`, module)
      return { error: e }
    }
  },
}
