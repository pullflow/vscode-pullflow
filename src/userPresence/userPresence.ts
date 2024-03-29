import { ExtensionContext, StatusBarItem } from 'vscode'
import { Store } from '../utils/store'
import { PresenceStatus } from '../utils'
import { Authorization } from '../utils/authorization'
import { log } from '../utils/logger'
import { Presence } from '../models/presence'

const filename = 'userPresence.ts'
const KEY_STROKE_COUNT = 50 // number of keystrokes to be considered in flow
const KEY_STROKE_INTERVAL = 20000 // 20 seconds
const FOCUS_INTERVAL = 10000 // 10 seconds

export const UserPresence = {
  update: async (context: ExtensionContext, statusBar: StatusBarItem) => {
    log.info('updating user flow', filename)

    const session = await Authorization.currentSession(context)
    if (!session) return
    const {
      keyStrokeCount: currentKeyStrokeCount,
      lastFocusedTime,
      lastKeyStrokeTime,
      isFocused,
    } = Store.get(context)

    if (currentKeyStrokeCount) {
      // if the user has typed enough keys and was not in flow before
      if (currentKeyStrokeCount >= KEY_STROKE_COUNT) {
        await Store.set(context, {
          previousPresenceStatus: PresenceStatus.Flow,
          keyStrokeCount: 0,
        })
        await Presence.set({
          status: PresenceStatus.Flow,
          context,
          statusBar,
        })
        return
      }
    }

    const timeSinceLastKeyStroke =
      new Date().getTime() - (lastKeyStrokeTime || 0)

    // if user has not typed anything in a while
    if (timeSinceLastKeyStroke > KEY_STROKE_INTERVAL) {
      await Store.set(context, { keyStrokeCount: 0 })
      if (isFocused && lastFocusedTime) {
        const timeSinceLastFocus = new Date().getTime() - lastFocusedTime
        // if user has been in focused mode for a while
        if (timeSinceLastFocus > FOCUS_INTERVAL) {
          await Store.set(context, {
            previousPresenceStatus: PresenceStatus.Active,
          })
          await Presence.set({
            status: PresenceStatus.Active,
            context,
            statusBar,
          })
          return
        }
      }
    }
    await Store.set(context, {
      previousPresenceStatus: PresenceStatus.Inactive,
    })
    await Presence.set({
      status: PresenceStatus.Inactive,
      context,
      statusBar,
    })
  },

  resetState: async (context: ExtensionContext) => {
    await Store.set(context, {
      lastFocusedTime: 0,
      keyStrokeCount: 0,
      lastKeyStrokeTime: 0,
    })
  },
}
