import { ExtensionContext, StatusBarItem } from 'vscode'
import { MessagePublisher } from '../../messages/messagePublisher'
import {
  ReviewerSelectionItem,
  CodeReviewSelectionItem,
  DefaultRoute,
} from '../../utils/types'
import { QuickPick } from './quickPick'

export const pullRequestUserPicker = ({
  reviewerItems,
  context,
  codeReviewItem,
  statusBar,
}: {
  reviewerItems: ReviewerSelectionItem[]
  context: ExtensionContext
  codeReviewItem: CodeReviewSelectionItem
  statusBar: StatusBarItem
}) => {
  QuickPick.create({
    items: reviewerItems,
    title: 'Reviewers',
    placeholder: 'Select reviewer',
    onDidChangeSelection: (selection) => {
      MessagePublisher.sendDirectMessage({
        toAccount: selection[0] as ReviewerSelectionItem,
        context,
        codeReviewId: codeReviewItem.id,
        fromAuthor: true,
        chatLink: codeReviewItem.link[DefaultRoute.Slack],
        statusBar,
      })
    },
  })
}
