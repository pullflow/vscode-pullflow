import { describe, expect, it } from '@jest/globals'
import { CodeReviewType } from '../../../utils'

describe('Active Pull Requests Items', () => {
  it('gets active pull request items for quick pick', async () => {
    const outcome = await subject().ActivePullRequestItems.get({
      pendingUserCodeReviews: mockCodeReviews,
      userAuthoredCodeReviews: mockCodeReviews,
    })
    expect(outcome).toEqual([
      { label: 'Waiting for me', kind: 2 },
      {
        label: '$(approved-icon)  #1 mock_pr',
        id: '1',
        description: '(mock_repo)',
        detail: 'Approved • Authored by gh_1 - Invalid date ago',
        link: { GitHub: 'mock_link', Slack: 'mock_link' },
        parentMessageXid: 'mock_xid',
        chatChannelId: '1',
        reviewers: [{ xid: 'gh_2', hasUser: true }],
        type: 0,
        author: { xid: 'gh_1', hasUser: true },
        prNumber: '1',
      },
      { label: 'Mine', kind: 2 },
      {
        label: '$(approved-icon)  #1 mock_pr',
        id: '1',
        description: '(mock_repo)',
        detail: 'Approved • Waiting for gh_2 - Invalid date ago',
        link: { GitHub: 'mock_link', Slack: 'mock_link' },
        parentMessageXid: 'mock_xid',
        chatChannelId: '1',
        reviewers: [{ xid: 'gh_2', hasUser: true }],
        type: 1,
        author: { xid: 'gh_1', hasUser: true },
        prNumber: '1',
      },
    ])
  })

  it('gets active pull requests items for quick pick with no authored pull requests', async () => {
    const outcome = await subject().ActivePullRequestItems.get({
      pendingUserCodeReviews: mockCodeReviews,
      userAuthoredCodeReviews: [],
    })
    expect(outcome).toEqual([
      { label: 'Waiting for me', kind: 2 },
      {
        label: '$(approved-icon)  #1 mock_pr',
        id: '1',
        description: '(mock_repo)',
        detail: 'Approved • Authored by gh_1 - Invalid date ago',
        link: { GitHub: 'mock_link', Slack: 'mock_link' },
        parentMessageXid: 'mock_xid',
        chatChannelId: '1',
        reviewers: [{ xid: 'gh_2', hasUser: true }],
        type: 0,
        author: { xid: 'gh_1', hasUser: true },
        prNumber: '1',
      },
      { label: 'Mine', kind: 2 },
    ])
  })
})

describe('Active pull requests formatting', () => {
  it('gets label for active pull request', async () => {
    const outcome = await subject().getLabel(mockCodeReviews[0])
    expect(outcome).toEqual('$(approved-icon)  #1 mock_pr')
  })

  it('gets detail for pending pull request', async () => {
    const outcome = await subject().getDetail({
      codeReview: mockCodeReviews[0],
      type: CodeReviewType.Pending,
    })
    expect(outcome).toEqual('Approved • Authored by gh_1 - Invalid date ago')
  })

  it('gets detail for authored pull request', async () => {
    const outcome = await subject().getDetail({
      codeReview: mockCodeReviews[0],
      type: CodeReviewType.Authored,
    })
    expect(outcome).toEqual('Approved • Waiting for gh_2 - Invalid date ago')
  })
})

export {}
const subject = () => {
  return require('./activePullRequestItems')
}

const mockCodeReviews = [
  {
    id: '1',
    number: '1',
    title: 'mock_pr',
    botReaction: '👍',
    link: 'mock_link',
    createdAt: `mock_date`,
    author: { xid: 'gh_1', hasUser: true },
    reviewers: [{ xid: 'gh_2', hasUser: true }],
    codeRepo: {
      id: '1',
      name: 'mock_repo',
      chatChannel: { id: '1', name: 'mock_channel', xid: 'slack_1' },
    },
    messageLink: 'mock_link',
    parentMessageXid: 'mock_xid',
    repoChannelConnection: {
      chatChannelId: '1',
    },
    prNumber: '1',
  },
]
