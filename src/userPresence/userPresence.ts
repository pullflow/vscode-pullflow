import { ExtensionContext, StatusBarItem } from 'vscode'
import { Store } from '../utils/store'
import { PresenceStatus } from '../utils'
import { Authorization } from '../utils/authorization'
import { log } from '../utils/logger'
import { Presence } from '../models/presence'
import { Trace } from '../utils/trace'

const filename = 'userPresence.ts'
const KEY_STROKE_COUNT = 50 // number of keystrokes to be considered in flow
const KEY_STROKE_INTERVAL = 20000 // 20 seconds
const FOCUS_INTERVAL = 10000 // 10 seconds

export const UserPresence = {
  update: async (context: ExtensionContext, statusBar: StatusBarItem) => {
    log.info('updating user flow', filename)

    const session = await Authorization.currentSession(context)
    if (!session) return

    const presenceStatus = {
      status: PresenceStatus.Inactive,
    }

    const {
      keyStrokeCount: currentKeyStrokeCount,
      lastFocusedTime,
      lastKeyStrokeTime,
      isFocused,
    } = Store.get(context)

    const timeSinceLastKeyStroke =
      new Date().getTime() - (lastKeyStrokeTime || 0)

    if (currentKeyStrokeCount) {
      // if the user has typed enough keys and was not in flow before
      if (currentKeyStrokeCount >= KEY_STROKE_COUNT) {
        presenceStatus.status = PresenceStatus.Flow
      }
    } else if (timeSinceLastKeyStroke > KEY_STROKE_INTERVAL) {
      // if user has not typed anything in a while
      await Store.set(context, { keyStrokeCount: 0 })
      if (isFocused && lastFocusedTime) {
        const timeSinceLastFocus = new Date().getTime() - lastFocusedTime
        // if user has been in focused mode for a while
        if (timeSinceLastFocus > FOCUS_INTERVAL) {
          presenceStatus.status = PresenceStatus.Active
        }
      }
    } else {
      presenceStatus.status = PresenceStatus.Inactive
    }
    await Store.set(context, {
      previousPresenceStatus: presenceStatus.status,
    })
    await Presence.set({
      status: presenceStatus.status,
      context,
      statusBar,
    })

    presenceTelemetry({ context, presenceStatus: presenceStatus.status })
  },

  resetState: async (context: ExtensionContext) => {
    await Store.set(context, {
      lastFocusedTime: 0,
      keyStrokeCount: 0,
      lastKeyStrokeTime: 0,
    })
  },
}

const presenceTelemetry = ({
  context,
  presenceStatus,
}: {
  context: ExtensionContext
  presenceStatus: PresenceStatus
}) => {
  const trace = new Trace(context)
  const { previousPresenceStatus } = Store.get(context)
  const span = trace.start({
    name: `presence-event-${presenceStatus}`,
    attributes: {
      status: presenceStatus,
    },
  })
  if (previousPresenceStatus !== presenceStatus) {
    trace.end({ span })
  }
}
