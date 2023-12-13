import { QuickPickItemKind } from 'vscode'
import {
  CacheObject,
  CodeReviewType,
  CodeReviewSelectionItem,
  UserCodeReview,
} from '../../../utils'
import * as moment from 'moment'
import { PullRequestIcons } from '../../../utils/pullRequestIcons'

export const ActivePullRequestItems = {
  get: (codeReviews: CacheObject): CodeReviewSelectionItem[] | [] => {
    const pendingCodeReviewItems = codeReviews.pendingUserCodeReviews?.map(
      (codeReview) =>
        createQuickPickItem({ codeReview, type: CodeReviewType.Pending })
    )
    const authoredCodeReviewItems = codeReviews.userAuthoredCodeReviews?.map(
      (codeReview) =>
        createQuickPickItem({ codeReview, type: CodeReviewType.Authored })
    )
    const pendingSeparator = {
      label: 'Waiting for me',
      kind: QuickPickItemKind.Separator,
    }
    const authoredSeparator = {
      label: 'Mine',
      kind: QuickPickItemKind.Separator,
    }
    const quickPickItems =
      pendingCodeReviewItems && authoredCodeReviewItems
        ? [
            pendingSeparator,
            ...pendingCodeReviewItems,
            authoredSeparator,
            ...authoredCodeReviewItems,
          ]
        : []

    return quickPickItems as CodeReviewSelectionItem[]
  },
}

const createQuickPickItem = ({
  codeReview,
  type,
}: {
  codeReview: UserCodeReview
  type: CodeReviewType
}) => {
  const label = getLabel(codeReview)
  const detail = getDetail({
    codeReview,
    type,
  })
  return {
    label,
    id: codeReview.id,
    description: `(${codeReview.codeRepo.name})`,
    detail,
    link: {
      GitHub: codeReview.link,
      Slack: codeReview.messageLink,
    },
    parentMessageXid: codeReview.parentMessageXid,
    chatChannelId: codeReview.repoChannelConnection.chatChannelId,
    reviewers: codeReview.reviewers,
    type,
    author: codeReview.author,
    prNumber: codeReview.number,
  }
}

export const getLabel = (codeReview: UserCodeReview) =>
  `$(${PullRequestIcons.getIcon(codeReview.botReaction)})  #${
    codeReview.number
  } ${codeReview.title}`

export const getDetail = ({
  codeReview,
  type,
}: {
  codeReview: UserCodeReview
  type: CodeReviewType
}) => {
  const iconDescription = PullRequestIcons.getDescription(
    codeReview.botReaction
  )

  return type === CodeReviewType.Pending
    ? `${iconDescription} • Authored by ${
        codeReview.author?.xid
      } - ${computeMoment(codeReview.createdAt)} ago`
    : `${iconDescription}${
        codeReview.reviewers?.length
          ? ` • Waiting for ${codeReview.reviewers
              .filter((reviewer) => !!reviewer)
              ?.map((reviewer) => reviewer.xid)
              .join(', ')}`
          : ''
      } - ${computeMoment(codeReview.createdAt)} ago`
}

const computeMoment = (createdAt: string) =>
  moment(new Date(parseInt(createdAt))).fromNow(true)
