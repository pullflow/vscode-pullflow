import * as path from 'path'
import * as dotenv from 'dotenv'

/** Get the full path of a filename from root */
const rootPath = (filename: string) => path.resolve(__dirname, `../${filename}`)

dotenv.config({ path: rootPath('.env') })

export const isDevelopment = () => process.env.NODE_ENV === 'development'

export const AppConfig = {
  app: {
    sessionSecret: process.env.SESSIONS_SECRET_KEY as string,
    clientIdentifier: process.env.CLIENT_IDENTIFIER as string,
  },
  pullflow: {
    baseUrl: (isDevelopment()
      ? process.env.PULLFLOW_DEV_APP_URL
      : process.env.PULLFLOW_APP_URL) as string,
    graphqlUrl: `${
      isDevelopment()
        ? process.env.PULLFLOW_DEV_APP_URL
        : process.env.PULLFLOW_APP_URL
    }/api/graphql`,
  },
}
