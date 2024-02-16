import { ExtensionContext } from 'vscode'
import { SpaceUser, SpaceUserSelectionItem } from '../../utils'
import { QuickPick } from './quickPick'

export const spaceUserPicker = ({
  context,
  placeholder,
  title,
  onDidChangeSelection,
  spaceUsers,
}: {
  context: ExtensionContext
  placeholder: string
  title: string
  onDidChangeSelection: (
    item: readonly SpaceUserSelectionItem[]
  ) => Promise<boolean>
  spaceUsers: SpaceUser[]
}) => {
  const spaceUsersItems = spaceUsers.map((user: SpaceUser) => {
    return {
      label: user.name,
      description: user.codeXid,
    }
  })
  QuickPick.create({
    context,
    title,
    items: spaceUsersItems,
    placeholder,
    onDidChangeSelection,
  })
}
