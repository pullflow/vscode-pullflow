import { log } from '../utils/logger'
import { ExtensionContext } from 'vscode'
import { PullflowApi } from '../utils/pullflowApi'

const module = 'spaceUsersApi.ts'

const SPACE_USERS_QUERY = `query spaceUsersForVscode {
	spaceUsersForVscode {
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
    context,
    authToken,
  }: {
    authToken: string
    context: ExtensionContext
  }) => {
    log.info(`fetching space users`, module)

    const pullflowApi = new PullflowApi(context, authToken)
    try {
      const data = await pullflowApi.fetch(SPACE_USERS_QUERY)
      return data.spaceUsersForVscode
    } catch (e) {
      log.error(`error in fetching space users, ${e}`, module)
      return { error: e }
    }
  },
}
