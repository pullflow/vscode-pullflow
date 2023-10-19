import { ExtensionContext, StatusBarItem, window } from 'vscode'
import { CodeReviewSelectionItem, PresenceStatus } from '../utils'
import { log } from '../utils/logger'
import { Authorization } from '../utils/authorization'
import { MessageApi } from '../api/messageApi'
import { Presence } from '../models/presence'

const module = 'message_publisher.ts'

export const MessagePublisher = {
  sendThreadMessage: async ({
    codeReview,
    context,
    statusBar,
  }: {
    codeReview: CodeReviewSelectionItem
    context: ExtensionContext
    statusBar: StatusBarItem
  }) => {
    log.info(
      `sending thread message. parentMessageXid: ${codeReview.parentMessageXid}`,
      module
    )
    const session = await Authorization.currentSession(context)
    const inputText = await getInputText({
      prompt:
        'Type a custom message or send the default message in the pull request thread.',
      placeHolder: "I'm on it.",
    })

    if (inputText === undefined) return false // text is undefined when user cancels input box

    const response = await MessageApi.sendCodeReviewThreadMessage({
      body: inputText || "I'm on it.",
      parentMessageXid: codeReview.parentMessageXid,
      chatChannelId: codeReview.chatChannelId,
      authToken: session?.accessToken ?? '',
      context,
    })

    if (response?.error) {
      window.showInformationMessage(
        `Something went wrong, failed to send message to thread for ${{
          codeReview,
        }}.`
      )
      return false
    }
    await Presence.set({
      status: PresenceStatus.Active,
      context,
      statusBar,
    })
    return true
  },

  sendDirectMessage: async ({
    toAccount,
    context,
    codeReviewId,
    chatLink,
    fromAuthor,
    statusBar,
  }: {
    toAccount: { xid: string; hasUser: boolean }
    context: ExtensionContext
    chatLink: string
    codeReviewId: string
    fromAuthor: boolean
    statusBar: StatusBarItem
  }) => {
    log.info(
      `sending direct message. toCodeAccountXid: ${toAccount.xid}`,
      module
    )

    const session = await Authorization.currentSession(context)
    const messageTemplate = fromAuthor
      ? `Reminder: I have a pull request waiting for you.`
      : `Is this PR ready for review?`
    const inputText = await getInputText({
      prompt: 'Type a custom message or send the default message.',
      placeHolder: messageTemplate,
    })

    if (inputText === undefined) return false // text is undefined when user cancels input box

    if (!toAccount.hasUser) {
      window.showInformationMessage(
        `Failed to send message to ${toAccount.xid} because they are not a Pullflow user.
            Please ask them to sign up to Pullflow at: https://app.pullflow.com`
      )
      return null
    }
    const message = inputText !== '' ? inputText : messageTemplate

    const response = await MessageApi.sendDirectMessage({
      message,
      codeAccountXid: toAccount.xid,
      chatLink,
      authToken: session?.accessToken ?? '',
      codeReviewId,
      fromAuthor,
      context,
    })

    if (response?.error) {
      window.showInformationMessage(
        `Something went wrong, failed to send message to ${toAccount.xid}.`
      )
      return false
    }

    await Presence.set({
      status: PresenceStatus.Active,
      context,
      statusBar,
    })

    return true
  },
}

const getInputText = ({
  prompt,
  placeHolder,
}: {
  prompt: string
  placeHolder: string
}) => {
  return window.showInputBox({
    prompt,
    placeHolder,
  })
}
