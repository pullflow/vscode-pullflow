import {
  ExtensionContext,
  QuickPickItem,
  StatusBarItem,
  Uri,
  env,
} from 'vscode'
import {
  CodeReviewSelectionItem,
  DefaultRoute,
  ActivePullRequestActions,
} from '../../../utils'
import { MessagePublisher } from '../../../messages/messagePublisher'
import { pullRequestUserPicker } from '../pullRequestUserPicker'
import { PullRequestQuickActions } from '../../../pullRequestQuickActions/pullRequestQuickActions'

export const pullRequestActionHandler = async ({
  selectedItem,
  codeReviewItem,
  context,
  statusBar,
}: {
  selectedItem: QuickPickItem
  codeReviewItem: CodeReviewSelectionItem
  context: ExtensionContext
  statusBar: StatusBarItem
}) => {
  if (selectedItem?.label === ActivePullRequestActions.OpenInSlack)
    openLink(codeReviewItem.link[DefaultRoute.Slack])
  if (selectedItem?.label === ActivePullRequestActions.OpenInGitHub)
    openLink(codeReviewItem.link[DefaultRoute.GitHub])

  if (selectedItem?.label === ActivePullRequestActions.SendMessageInThread) {
    await MessagePublisher.sendThreadMessage({
      codeReview: codeReviewItem,
      context,
      statusBar,
    })
  }
  if (selectedItem?.label === ActivePullRequestActions.SendMessageToReviewers) {
    const reviewerItems = codeReviewItem.reviewers.map((reviewer) => ({
      label: reviewer.xid,
      ...reviewer,
    }))
    pullRequestUserPicker({
      reviewerItems,
      context,
      codeReviewItem,
      statusBar,
    })
  }
  if (selectedItem?.label === ActivePullRequestActions.SendMessageToAuthor) {
    await MessagePublisher.sendDirectMessage({
      toAccount: codeReviewItem.author,
      context,
      codeReviewId: codeReviewItem.id,
      fromAuthor: false,
      chatLink: codeReviewItem.link[DefaultRoute.Slack],
      statusBar,
    })
  }
  if (selectedItem?.label === ActivePullRequestActions.ApplyLabel) {
    await PullRequestQuickActions.applyLabel({
      codeReview: codeReviewItem,
      context,
      statusBar,
    })
  }
  if (selectedItem?.label === ActivePullRequestActions.Approve) {
    await PullRequestQuickActions.approve({
      codeReview: codeReviewItem,
      context,
      statusBar,
    })
  }
  if (selectedItem?.label === ActivePullRequestActions.AddAssignee) {
    await PullRequestQuickActions.addAssignee({
      codeReview: codeReviewItem,
      context,
      statusBar,
    })
  }
  if (selectedItem?.label === ActivePullRequestActions.RequestReview) {
    await PullRequestQuickActions.requestReview({
      codeReview: codeReviewItem,
      context,
      statusBar,
    })
  }
  if (selectedItem?.label === ActivePullRequestActions.SetReminder) {
    await PullRequestQuickActions.setReminder({
      codeReview: codeReviewItem,
      context,
    })
  }
  if (selectedItem?.label === ActivePullRequestActions.Refresh) {
    await PullRequestQuickActions.refresh({
      codeReviewId: codeReviewItem.id,
      context,
      statusBar,
    })
  }
}

const openLink = (link: string) => env.openExternal(Uri.parse(link))
