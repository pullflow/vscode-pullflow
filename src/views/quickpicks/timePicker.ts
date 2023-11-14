import { QuickPickItem } from 'vscode'
import { QuickPick } from './quickPick'

export interface TimeSelectionItem extends QuickPickItem {
  value: number
}
export const TimeIntervals: TimeSelectionItem[] = [
  {
    label: '30 minutes',
    value: 30,
  },
  {
    label: '45 minutes',
    value: 45,
  },
  {
    label: '1 hour',
    value: 60,
  },
  {
    label: '2 hours',
    value: 120,
  },
]

export const timePicker = ({
  title,
  onDidChangeSelection,
}: {
  title: string
  onDidChangeSelection: (
    selection: readonly TimeSelectionItem[]
  ) => Promise<Boolean>
}) => {
  QuickPick.create({
    items: TimeIntervals,
    title,
    placeholder: 'Choose time interval',
    onDidChangeSelection,
  })
}
