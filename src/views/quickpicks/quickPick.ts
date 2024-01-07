import { ExtensionContext, QuickPickItem, window } from 'vscode'
import { Telemetry } from '../../utils/telemetry'

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
    const trace = new Telemetry(context)
    const quickPick = window.createQuickPick<Type>()
    const span = trace.start({
      name: title,
      attributes: {
        items: items.toString(),
        title,
      },
    })

    quickPick.items = items
    quickPick.title = title
    quickPick.placeholder = placeholder
    quickPick.onDidChangeSelection(onDidChangeSelection)
    quickPick.onDidHide(() => {
      trace.end(span)
      quickPick.dispose()
    })
    quickPick.onDidAccept(() => {
      trace.end(span)
      quickPick.dispose()
    })
    quickPick.show()
  },
}
