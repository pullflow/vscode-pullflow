import { AuthenticationSession, ExtensionContext } from 'vscode'
import { User } from '.'
import { AppConfig } from './appConfig'
import { Store } from './store'

export const Authorization = {
  /** creates session in vs code  */
  createSession: async ({
    user,
    context,
  }: {
    user: User
    context: ExtensionContext
  }) => {
    const session: AuthenticationSession = {
      id: user.username,
      accessToken: user.authToken,
      account: {
        label: user.username,
        id: user.username,
      },
      scopes: [],
    }
    await context.secrets.store(
      AppConfig.app.sessionSecret,
      JSON.stringify(session)
    )
    return session
  },

  /** waits for user to come back to vscode after Pullflow login */
  waitForUser: (context: ExtensionContext, ms: number) => {
    const startTime = new Date().getTime()
    return new Promise<User | undefined>((resolve) => {
      const interval = setInterval(() => {
        const user = Store.get(context)?.user
        if (user || new Date().getTime() - startTime > ms) {
          resolve(user)
          clearInterval(interval)
        }
      }, 50)
    })
  },

  currentSession: async (
    context: ExtensionContext
  ): Promise<AuthenticationSession | null> => {
    const session = await context.secrets.get(AppConfig.app.sessionSecret)
    return session ? (JSON.parse(session) as AuthenticationSession) : null
  },
}
