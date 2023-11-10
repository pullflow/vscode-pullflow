import { log } from '../utils/logger'
import { ExtensionContext } from 'vscode'
import { PullflowApi } from '../utils/pullflowApi'

const module = 'activePullRequestsApi.ts'

const CODE_REVIEW_QUERY = `query codeReviews {
  userCodeReviews {
    ... on UserNotFoundError {
      message
    }
    ... on UserCodeReviews {
      pending {
        id
        number
        title
        botReaction
        link
        createdAt
        author {
          xid
          hasUser
        }
        reviewers {
          xid
          hasUser
        }
        codeRepo {
          name
        }
        repoChannelConnection {
          chatChannelId

        }
        messageLink
        parentMessageXid
      }
      authored {
        id
        number
        title
        botReaction
        link
        createdAt
        author {
          xid
          hasUser
        }
        reviewers {
          xid
          hasUser
        }
        codeRepo {
          name
        }
        repoChannelConnection {
          chatChannelId
        }
        messageLink
        parentMessageXid
      }
    }
  }
}
`

const REFRESH_PULL_REQUEST_MUTATION = `
  mutation refreshCodeReviewsForVscode($authorXids: [String]!) {
    refreshCodeReviewsForVscode(authorXids: $authorXids){
      success
      message
    }
}
`

export const ActivePullRequestsApi = {
  getCodeReviews: async ({
    context,
    accessToken,
  }: {
    accessToken?: string
    context: ExtensionContext
  }) => {
    log.info(`fetching pull requests`, module)

    const pullflowApi = new PullflowApi(context, accessToken)
    try {
      const data = await pullflowApi.fetch(CODE_REVIEW_QUERY)
      return data.userCodeReviews
    } catch (e) {
      log.error(`error in fetching pull requests, ${e}`, module)
      return { error: e }
    }
  },

  refreshCodeReviews: async ({
    context,
    accessToken,
    authorXids,
  }: {
    accessToken?: string
    context: ExtensionContext
    authorXids: string[]
  }) => {
    log.info(`refreshing pull requests`, module)

    const pullflowApi = new PullflowApi(context, accessToken)
    try {
      const data = await pullflowApi.fetch(REFRESH_PULL_REQUEST_MUTATION, {
        authorXids,
      })
      return data.refreshCodeReviewsForVscode
    } catch (e) {
      log.error(`error in refreshing pull requests, ${e}`, module)
      return { error: e }
    }
  },
}
