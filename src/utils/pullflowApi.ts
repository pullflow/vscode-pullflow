import { commands, ExtensionContext, window } from 'vscode'
import fetch, { RequestInit } from 'node-fetch'
import { ApiVariables } from './types'
import { AppConfig } from './appConfig'
import { log } from '../utils/logger'
import { Authorization } from './authorization'
import { Command } from './commands'

const module = 'pullflowApi.ts'

const TOKEN_REFRESH_QUERY = `mutation requestTokenRefresh($token: String!) {
  requestTokenRefresh(token: $token) {
    data { accessToken refreshToken }
    error
  }
}
`

type PullflowResponse = {
  errors: { extensions: { code: string }; message: string }[]
  data: unknown
}
export class PullflowApi {
  apiUrl: string
  options: { method: string; headers: {} }
  context: ExtensionContext

  constructor(
    context: ExtensionContext,
    accessToken?: string,
    method: string = 'POST'
  ) {
    this.options = {
      method,
      headers: {
        authorization: `Bearer ${accessToken ?? ''}`,
        version: context.extension.packageJSON.version,
        Accept: 'application/json, text/plain',
        'Content-Type': 'application/json;charset=UTF-8',
        'auth-provider': 'custom-auth',
        'event-provider': 'extension',
      },
    }
    this.apiUrl = AppConfig.pullflow.graphqlUrl
    this.context = context
  }

  async refreshToken() {
    log.info('refreshing access token', module)
    const refreshToken = await this.context.secrets.get('userRefreshToken')

    if (!refreshToken) {
      log.error('No refresh token in store', module)
      window.showInformationMessage(`Something went wrong. Please login again.`)
      commands.executeCommand(Command.signOut)
      return
    }

    const response = await fetch(this.apiUrl, {
      ...this.options,
      body: JSON.stringify({
        query: TOKEN_REFRESH_QUERY,
        variables: { token: refreshToken },
      }),
    })

    if (!response.ok) {
      log.error('Invalid response from refresh request', module)
      window.showInformationMessage(`Something went wrong. Please login again.`)
      commands.executeCommand(Command.signOut)
      return
    }
    const jsonResponse = (await response.json()) as {
      data: {
        requestTokenRefresh: {
          data?: { accessToken: string; refreshToken: string }
          error?: string
        }
      }
    }
    const { data, error } = jsonResponse.data.requestTokenRefresh

    if (error || !data) {
      log.error(error ? error : 'No data returned', module)
      window.showInformationMessage(`Something went wrong. Please login again.`)
      commands.executeCommand(Command.signOut)
      return
    }

    const { refreshToken: newRefreshToken, accessToken: newAccessToken } = data
    await this.context.secrets.store('userRefreshToken', newRefreshToken)
    const currentSession = await Authorization.currentSession(this.context)

    await this.context.secrets.store(
      AppConfig.app.sessionSecret,
      JSON.stringify({ ...currentSession, accessToken: newAccessToken })
    )

    this.options = {
      ...this.options,
      headers: {
        ...this.options?.headers,
        authorization: `Bearer ${newAccessToken}`,
      },
    }

    return this.options
  }

  async fetch(query: string, variables?: ApiVariables) {
    const options = {
      ...this.options,
      body: JSON.stringify({
        query,
        ...(variables && { variables }),
      }),
    }

    const sendRequest = async (opt: RequestInit | undefined) => {
      const response = await fetch(this.apiUrl, opt)
      if (!response.ok) throw new Error(response.statusText)
      const data = (await response.json()) as PullflowResponse
      if (data.errors) {
        if (data.errors[0]?.extensions?.code === 'UNAUTHENTICATED')
          return { error: 'UNAUTHENTICATED' }
        return { error: data.errors[0].message } // return the message
      }
      return { data }
    }

    const sendRequestWithRetry = async (opt: RequestInit | undefined) => {
      const response = await sendRequest(opt)
      if ('error' in response && response.error === 'UNAUTHENTICATED') {
        const updatedOpts: any = await this.refreshToken()
        return sendRequest({ ...opt, ...updatedOpts })
      }
      return response
    }

    const response: { data: PullflowResponse } | { error: string } =
      query.includes('presence')
        ? await sendRequest(options)
        : await sendRequestWithRetry(options)

    if ('error' in response) throw new Error(response.error)

    return response.data.data as any // TODO: Fix later; to avoid errors for now
  }
}
