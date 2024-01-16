import { ExtensionContext, QuickPickItem, window } from 'vscode'
import { instantiatePullflowTracer } from '../../utils/trace'

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

    const trace = instantiatePullflowTracer(context)
    trace.start({
      name: title,
    })

    quickPick.items = items
    quickPick.title = title
    quickPick.placeholder = placeholder
    quickPick.onDidChangeSelection(onDidChangeSelection)

    quickPick.onDidHide(() => {
      trace.end({
        attributes: {
          title,
        },
      })
      quickPick.dispose()
    })

    quickPick.onDidAccept(() => {
      trace.end({
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
