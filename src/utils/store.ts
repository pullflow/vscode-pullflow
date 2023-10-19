import { ExtensionContext } from 'vscode'
import { CacheObject } from './types'

const CACHE_NAME = 'com.pullflow.app'

export const Store = {
  get: (context: ExtensionContext) => {
    return context.globalState.get<CacheObject>(CACHE_NAME) || {}
  },

  set: async (context: ExtensionContext, cache: CacheObject) => {
    await context.globalState.update(CACHE_NAME, {
      ...Store.get(context),
      ...cache,
    })
  },

  clear: async (context: ExtensionContext) => {
    await context.globalState.update(CACHE_NAME, {})
  },
}
