import { ExtensionContext, StatusBarItem, window } from 'vscode'
import { Store } from '../utils/store'
import { ActivePullRequestItems } from '../views/quickpicks/items/activePullRequestItems'
import { pullRequestActionPicker } from '../views/quickpicks/pullRequestActionPicker'
import { CodeReviewSelectionItem } from '../utils'
import { QuickPick } from '../views/quickpicks/quickPick'

export const ActivePullRequests = (
  context: ExtensionContext,
  statusBar: StatusBarItem
) => {
  const codeReviews = Store.get(context)
  if (!codeReviews) return

  if (
    !codeReviews?.pendingUserCodeReviews?.length &&
    !codeReviews?.userAuthoredCodeReviews?.length
  ) {
    window.showInformationMessage('PullFlow: You have no PRs waiting for you.')
    return
  }

  const activePullRequestItems = ActivePullRequestItems.get(codeReviews)

  QuickPick.create({
    context,
    items: activePullRequestItems,
    title: 'My Active Pull Requests',
    placeholder: 'select pull request',
    onDidChangeSelection: (selection) => {
      pullRequestActionPicker({
        selectedCodeReview: selection[0] as CodeReviewSelectionItem,
        context,
        statusBar,
      })
    },
  })
}
