import { log } from '../utils/logger'
import { ExtensionContext } from 'vscode'
import { PresenceStatus, RepoInfo } from '../utils'
import { PullflowApi } from '../utils/pullflowApi'

const module = 'presenceApi.ts'

const SET_USER_PRESENCE = `
  mutation setPresence($eventProvider: EventProvider!, $status: PresenceStatus!, $repoName: String!, $branch: String){
    setPresence(eventProvider: $eventProvider, status: $status, repoName: $repoName, branch: $branch)
  }
`

export const PresenceApi = {
  setPresence: async ({
    status,
    accessToken,
    repoInfo,
    context,
  }: {
    status: PresenceStatus
    accessToken: string
    repoInfo: RepoInfo
    context: ExtensionContext
  }) => {
    log.info(`setting user presence: ${{ status }}`, module)

    const pullflowApi = new PullflowApi(context, accessToken)
    try {
      const data = await pullflowApi.fetch(SET_USER_PRESENCE, {
        status,
        eventProvider: 'VSCode',
        ...repoInfo,
      })
      return data.setPresence
    } catch (error) {
      log.error(`error in sending code review user message, ${error}`, module)
      return { error }
    }
  },
}
