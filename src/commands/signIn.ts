import { ExtensionContext, StatusBarItem, Uri, env, window } from 'vscode'
import { AppConfig } from '../utils/appConfig'
import { Authorization } from '../utils/authorization'
import { initialize } from '../utils/initialize'

const SIGN_IN_TIME_OUT = 120000 // sign in time out in ms

export const SignIn = async ({
  context,
  statusBar,
}: {
  context: ExtensionContext
  statusBar: StatusBarItem
}) => {
  const redirectUri = `${env.uriScheme}://${context.extension.packageJSON.publisher}.${context.extension.packageJSON.name}`
  const signInUrl = AppConfig.pullflow.baseUrl

  env.openExternal(
    Uri.parse(
      `${signInUrl}/?clientIdentifier=${AppConfig.app.clientIdentifier}&clientUri=${redirectUri}`
    )
  )
  const user = await Authorization.waitForUser(context, SIGN_IN_TIME_OUT)
  if (!user) {
    window.showErrorMessage('Pullflow: Sign in failed')
    return
  }
  const session =
    (await Authorization.currentSession(context)) ||
    (await Authorization.createSession({ user, context }))

  if (!session) {
    window.showErrorMessage('Pullflow: Sign in failed')
    return
  }
  await initialize({ context, statusBar })
}
