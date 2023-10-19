import { log } from '../utils/logger'
import { ExtensionContext } from 'vscode'
import { PullflowApi } from '../utils/pullflowApi'

const module = 'messageApi.ts'
const eventProvider = 'VSCode'

const SEND_CODE_REVIEW_THREAD_MESSAGE = `
  mutation sendCodeReviewThreadMessage($parentMessageXid: String!, $chatChannelId: String!, $body: String!, $eventProvider: EventProvider){
    sendCodeReviewThreadMessage(threadMessageXid: $parentMessageXid, chatChannelId: $chatChannelId, body: $body, eventProvider: $eventProvider)
  }
`

const SEND_CODE_REVIEW_DIRECT_MESSAGE = `
  mutation sendCodeReviewDirectMessage($message: String!, $fromAuthor: Boolean!, $codeAccountXid: String!, $codeReviewChatLink: String!, $codeReviewId: String!) {
    sendCodeReviewDirectMessage(message: $message, fromAuthor: $fromAuthor, codeAccountXid: $codeAccountXid, codeReviewChatLink: $codeReviewChatLink, codeReviewId: $codeReviewId)
  }
`

export const MessageApi = {
  sendCodeReviewThreadMessage: async ({
    body,
    parentMessageXid,
    chatChannelId,
    authToken,
    context,
  }: {
    body: string
    parentMessageXid: string
    chatChannelId: string
    authToken: string
    context: ExtensionContext
  }) => {
    log.info(
      `sending a code review thread message: ${{ parentMessageXid }}, ${{
        chatChannelId,
      }}`,
      module
    )

    const pullflowApi = new PullflowApi(context, authToken)
    try {
      const data = await pullflowApi.fetch(SEND_CODE_REVIEW_THREAD_MESSAGE, {
        body,
        parentMessageXid,
        chatChannelId,
        eventProvider,
      })
      return data.sendCodeReviewThreadMessage
    } catch (error) {
      log.error(`error in sending code review user message, ${error}`, module)
      return { error }
    }
  },

  sendDirectMessage: async ({
    codeAccountXid,
    codeReviewId,
    chatLink,
    authToken,
    message,
    fromAuthor,
    context,
  }: {
    codeAccountXid: string
    chatLink: string
    authToken: string
    codeReviewId: string
    message: string
    fromAuthor: boolean
    context: ExtensionContext
  }) => {
    log.info(`nudging user: ${{ codeAccountXid }}, ${{ chatLink }}`, module)

    const pullflowApi = new PullflowApi(context, authToken)
    try {
      const data = await pullflowApi.fetch(SEND_CODE_REVIEW_DIRECT_MESSAGE, {
        codeAccountXid,
        codeReviewId,
        codeReviewChatLink: chatLink,
        message,
        fromAuthor,
        eventProvider,
      })
      return data.sendCodeReviewDirectMessage
    } catch (error) {
      log.error(`error in nudging user, ${error}`, module)
      return { error }
    }
  },
}
