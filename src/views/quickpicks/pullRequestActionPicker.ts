import { ExtensionContext, StatusBarItem } from 'vscode'
import { QuickPick } from './quickPick'
import {
  CodeReviewSelectionItem,
  CodeReviewType,
  ActivePullRequestActions,
} from '../../utils'
import { pullRequestActionHandler } from './selectHandlers/pullRequestActionHandler'

const getActionItems = (type: CodeReviewType) => [
  {
    label: ActivePullRequestActions.OpenInSlack,
  },
  {
    label: ActivePullRequestActions.OpenInGitHub,
  },
  {
    label: ActivePullRequestActions.SendMessageInThread,
  },
  {
    label:
      type === CodeReviewType.Pending
        ? ActivePullRequestActions.SendMessageToAuthor
        : ActivePullRequestActions.SendMessageToReviewers,
  },
  {
    label: ActivePullRequestActions.ApplyLabel,
  },
  {
    label: ActivePullRequestActions.AddAssignee,
  },
  {
    label: ActivePullRequestActions.RequestReview,
  },
  { label: ActivePullRequestActions.SetReminder },
  {
    label: ActivePullRequestActions.Refresh,
  },
]

export const pullRequestActionPicker = ({
  selectedCodeReview,
  context,
  statusBar,
}: {
  selectedCodeReview: CodeReviewSelectionItem
  context: ExtensionContext
  statusBar: StatusBarItem
}) => {
  const menuItems = getActionItems(selectedCodeReview.type)
  if (selectedCodeReview.type === CodeReviewType.Pending) {
    menuItems.push({
      label: ActivePullRequestActions.Approve,
    })
  }
  QuickPick.create({
    items: menuItems,
    title: 'Code Review Actions',
    placeholder: 'Select action',
    onDidChangeSelection: async (selection) => {
      await pullRequestActionHandler({
        selectedItem: selection[0],
        codeReviewItem: selectedCodeReview,
        context,
        statusBar,
      })
    },
  })
}
