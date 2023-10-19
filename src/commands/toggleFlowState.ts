import { ExtensionContext, StatusBarItem } from 'vscode'
import { PresenceStatus } from '../utils'
import { Presence } from '../models/presence'
import { Store } from '../utils/store'

export const ToggleFlowState = async (
  context: ExtensionContext,
  statusBar: StatusBarItem
) => {
  const { previousPresenceStatus } = Store.get(context)

  if (previousPresenceStatus === PresenceStatus.Flow) {
    await Presence.set({
      status: PresenceStatus.Active,
      context,
      statusBar,
    })
    return
  }
  await Presence.set({
    status: PresenceStatus.Flow,
    context,
    statusBar,
  })
  return
}
