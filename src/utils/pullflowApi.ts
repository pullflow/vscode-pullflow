import { ExtensionContext } from 'vscode'
import fetch from 'node-fetch'
import { ApiVariables } from './types'
import { AppConfig } from './appConfig'

export class PullflowApi {
  apiUrl: string
  options: {
    method: string
    headers: {
      authorization: string
      version: string
    }
  }

  constructor(
    context: ExtensionContext,
    accessToken?: string,
    method: string = 'POST'
  ) {
    this.options = {
      method,
      headers: {
        authorization: accessToken ?? '',
        version: context.extension.packageJSON.version,
      },
    }
    this.apiUrl = AppConfig.pullflow.graphqlUrl
  }

  async fetch(query: string, variables?: ApiVariables) {
    const options = {
      ...this.options,
      body: JSON.stringify({
        query,
        ...(variables && { variables }),
      }),
    }
    const response = await fetch(this.apiUrl, options)
    if (!response.ok) throw new Error(response.statusText)
    const data: any = await response.json()
    if (data.errors) throw new Error(data.errors[0].message)
    return data.data
  }
}
