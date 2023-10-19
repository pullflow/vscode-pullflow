import * as path from 'path'

/** Get the full path of a filename from root */
const rootPath = (filename: string) => path.resolve(__dirname, `../${filename}`)

require('dotenv').config({ path: rootPath('.env') })

export const AppConfig = {
  app: {
    sessionSecret: process.env.SESSIONS_SECRET_KEY as string,
    clientIdentifier: process.env.CLIENT_IDENTIFIER as string,
  },
  pullflow: {
    baseUrl: process.env['PULLFLOW_APP_URL'] as string,
    graphqlUrl: `${process.env['PULLFLOW_APP_URL']}/api/graphql`,
  },
}
