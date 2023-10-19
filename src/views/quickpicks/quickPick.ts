import { QuickPickItem, window } from 'vscode'

export const QuickPick = {
  create: ({
    items,
    title,
    placeholder,
    onDidChangeSelection,
  }: {
    items: QuickPickItem[]
    title: string
    placeholder: string
    onDidChangeSelection: (selection: readonly QuickPickItem[]) => void
  }) => {
    const quickPick = window.createQuickPick()
    quickPick.items = items
    quickPick.title = title
    quickPick.placeholder = placeholder
    quickPick.onDidChangeSelection(onDidChangeSelection)
    quickPick.onDidHide(() => quickPick.dispose())
    quickPick.onDidAccept(() => quickPick.dispose())
    quickPick.show()
  },
}
