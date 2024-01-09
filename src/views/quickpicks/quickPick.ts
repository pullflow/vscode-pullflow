import { ExtensionContext, QuickPickItem, window } from 'vscode'
import { Trace } from '../../utils/trace'

export const QuickPick = {
  create: <Type extends QuickPickItem>({
    context,
    items,
    title,
    placeholder,
    onDidChangeSelection,
  }: {
    context: ExtensionContext
    items: Type[]
    title: string
    placeholder: string
    onDidChangeSelection: (selection: readonly Type[]) => void
  }) => {
    const quickPick = window.createQuickPick<Type>()

    const trace = new Trace(context)
    const span = trace.start({
      name: title,
    })

    quickPick.items = items
    quickPick.title = title
    quickPick.placeholder = placeholder
    quickPick.onDidChangeSelection(onDidChangeSelection)

    quickPick.onDidHide(() => {
      trace.end({
        span,
        attributes: {
          title,
        },
      })
      quickPick.dispose()
    })

    quickPick.onDidAccept(() => {
      trace.end({
        span,
        attributes: {
          title,
          selectedItem: quickPick.selectedItems[0]?.label,
        },
      })
      quickPick.dispose()
    })

    quickPick.show()
  },
}
