import { PresenceApi } from '../api/presenceApi'
import { PresenceStatus, RepoInfo, StatusBarState } from '../utils'
import { ExtensionContext, StatusBarItem, extensions, window } from 'vscode'
import { Authorization } from '../utils/authorization'
import { log } from '../utils/logger'
import { Store } from '../utils/store'
import { StatusBar } from '../views/statusBar/statusBar'

const module = 'presence.ts'

export const Presence = {
  set: async ({
    status,
    context,
    statusBar,
  }: {
    status: PresenceStatus
    context: ExtensionContext
    statusBar: StatusBarItem
  }) => {
    log.info(`setting presence to ${status}`, module)
    const session = await Authorization.currentSession(context)
    if (!session) return

    await Store.set(context, {
      previousPresenceStatus: status,
    })
    const repoInfo = getBranchAndRepo()

    const response = await PresenceApi.setPresence({
      status,
      authToken: session.accessToken,
      context,
      repoInfo,
    })
    if (!!!response) {
      window.showInformationMessage(
        `Something went wrong, in setting presence.`
      )
    }
    StatusBar.update({ context, statusBar, state: StatusBarState.SignedIn })
  },
}

// TODO: move this to utils
const getBranchAndRepo = (): RepoInfo => {
  log.info(`getting branch and repo`, module)

  const gitExtension = extensions.getExtension('vscode.git')
  if (gitExtension) {
    const gitAPI = gitExtension.exports.getAPI(1)
    const repository = gitAPI.repositories[0]

    if (repository) {
      return {
        repoName: repository.rootUri.fsPath.match(/[^/]+$/)[0],
        branch: repository.state.HEAD.name,
      }
    } else {
      log.info('No Git repository found.', module)
      return { repoName: '', branch: '' }
    }
  } else {
    log.info('Git extension not found.', module)
    return { repoName: '', branch: '' }
  }
}
