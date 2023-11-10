import { QuickPickItem, window } from 'vscode'

export const QuickPick = {
  create: <Type extends QuickPickItem>({
    items,
    title,
    placeholder,
    onDidChangeSelection,
  }: {
    items: Type[]
    title: string
    placeholder: string
    onDidChangeSelection: (selection: readonly Type[]) => void
  }) => {
    const quickPick = window.createQuickPick<Type>()
    quickPick.items = items
    quickPick.title = title
    quickPick.placeholder = placeholder
    quickPick.onDidChangeSelection(onDidChangeSelection)
    quickPick.onDidHide(() => quickPick.dispose())
    quickPick.onDidAccept(() => quickPick.dispose())
    quickPick.show()
  },
}
