import { ExtensionContext, window } from 'vscode'
import { Store } from '../../utils/store'
import { SpaceUser, SpaceUserSelectionItem } from '../../utils'
import { QuickPick } from './quickPick'

export const spaceUserPicker = ({
  context,
  placeholder,
  title,
  onDidChangeSelection,
}: {
  context: ExtensionContext
  placeholder: string
  title: string
  onDidChangeSelection: (
    item: readonly SpaceUserSelectionItem[]
  ) => Promise<boolean>
}) => {
  const spaceUsers = Store.get(context)?.spaceUsers
  if (!spaceUsers) {
    window.showInformationMessage(`Failed to find space users`)
    return
  }
  const spaceUsersItems = spaceUsers.map((user: SpaceUser) => {
    return {
      label: user.name,
      description: user.codeXid,
    }
  })
  QuickPick.create({
    title,
    items: spaceUsersItems,
    placeholder,
    onDidChangeSelection,
  })
}
