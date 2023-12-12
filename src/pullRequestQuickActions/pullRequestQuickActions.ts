import { ExtensionContext, window, StatusBarItem } from 'vscode'
import {
  CodeReviewSelectionItem,
  PresenceStatus,
  StatusBarState,
  UserCodeReview,
} from '../utils'
import { Authorization } from '../utils/authorization'
import { PullRequestQuickActionsApi } from '../api/pullRequestQuickActionsApi'
import { spaceUserPicker } from '../views/quickpicks/spaceUserPicker'
import { Presence } from '../models/presence'
import { Store } from '../utils/store'
import { StatusBar } from '../views/statusBar/statusBar'
import { TimeSelectionItem, timePicker } from '../views/quickpicks/timePicker'
import moment = require('moment')
import { PullRequestState } from '../utils/pullRequestsState'

export const PullRequestQuickActions = {
  applyLabel: async ({
    codeReview,
    context,
    statusBar,
  }: {
    codeReview: CodeReviewSelectionItem
    context: ExtensionContext
    statusBar: StatusBarItem
  }) => {
    const session = await Authorization.currentSession(context)

    const inputText = await window.showInputBox({
      prompt: 'Add labels',
      placeHolder: 'bug, enhancement, etc.',
    })
    if (inputText === undefined) return false // text is undefined when user cancels input box
    if (inputText === '') {
      window.showInformationMessage(
        `Failed to send empty message to author. Please add a tag.`
      )
    }
    const response = await PullRequestQuickActionsApi.addLabels({
      labels: inputText,
      codeReviewId: codeReview.id,
      authToken: session?.accessToken ?? '',
      context,
    })

    if (response?.error || response?.message) {
      window.showInformationMessage(
        `${
          response.message
            ? response.message
            : 'Something went wrong, failed to add labels to pull request'
        }`
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

  approve: async ({
    codeReview,
    context,
    statusBar,
  }: {
    codeReview: CodeReviewSelectionItem
    context: ExtensionContext
    statusBar: StatusBarItem
  }) => {
    const session = await Authorization.currentSession(context)

    const inputText = await window.showInputBox({
      prompt: 'Leave a comment or approve without comment.',
    })
    if (inputText === undefined) return false // text is undefined when user cancels input box

    const response = await PullRequestQuickActionsApi.approve({
      body: inputText,
      codeReviewId: codeReview.id,
      authToken: session?.accessToken ?? '',
      context,
    })

    if (response?.error || response?.message) {
      window.showInformationMessage(
        `${
          response.message
            ? response.message
            : 'Pullflow: Something went wrong, failed to approve pull request'
        }`
      )
      return false
    }

    window.showInformationMessage(`Pullflow: Pull request approved`)
    await Presence.set({
      status: PresenceStatus.Active,
      context,
      statusBar,
    })

    // removing from pending PRs
    const pendingUserCodeReviews = Store.get(
      context
    )?.pendingUserCodeReviews?.filter((pr) => pr.id !== codeReview.id) as [
      UserCodeReview
    ]
    await Store.set(context, {
      pendingUserCodeReviews,
    })
    StatusBar.update({
      context,
      statusBar,
      state: StatusBarState.SignedIn,
    })

    return true
  },

  addAssignee: async ({
    codeReview,
    context,
    statusBar,
  }: {
    codeReview: CodeReviewSelectionItem
    context: ExtensionContext
    statusBar: StatusBarItem
  }) => {
    spaceUserPicker({
      context,
      placeholder: 'Select a user',
      title: 'Add assignee to pull request',
      onDidChangeSelection: async (item) => {
        if (!item[0].description) return false

        const session = await Authorization.currentSession(context)
        const response = await PullRequestQuickActionsApi.addAssignee({
          assigneeXid: item[0].description,
          codeReviewId: codeReview.id,
          authToken: session?.accessToken ?? '',
          context,
        })

        if (response?.error || response?.message) {
          window.showInformationMessage(
            `${
              response.message
                ? response.message
                : 'Something went wrong, failed to add assignee to pull request'
            }`
          )
          return false
        }
        return true
      },
    })
    await Presence.set({
      status: PresenceStatus.Active,
      context,
      statusBar,
    })
  },

  requestReview: async ({
    codeReview,
    context,
    statusBar,
  }: {
    codeReview: CodeReviewSelectionItem
    context: ExtensionContext
    statusBar: StatusBarItem
  }) => {
    spaceUserPicker({
      context,
      placeholder: 'Select a user',
      title: 'Add reviewer to pull request',
      onDidChangeSelection: async (item) => {
        if (!item[0].description) return false

        const session = await Authorization.currentSession(context)
        const response = await PullRequestQuickActionsApi.requestReview({
          reviewerXid: item[0].description,
          codeReviewId: codeReview.id,
          authToken: session?.accessToken ?? '',
          context,
        })

        if (response?.error || response?.message) {
          window.showInformationMessage(
            `${
              response.message
                ? response.message
                : 'Something went wrong, failed to add reviewer to pull request'
            }`
          )
          return false
        }

        window.showInformationMessage(
          `Pullflow: ${item[0].label} added as reviewer to pull request #${codeReview.prNumber}.`
        )
        return true
      },
    })
    await Presence.set({
      status: PresenceStatus.Active,
      context,
      statusBar,
    })
  },

  refresh: async ({
    codeReviewId,
    context,
    statusBar,
  }: {
    codeReviewId: string
    context: ExtensionContext
    statusBar: StatusBarItem
  }) => {
    const session = await Authorization.currentSession(context)
    const response = await PullRequestQuickActionsApi.refresh({
      codeReviewId,
      authToken: session?.accessToken ?? '',
      context,
    })
    if (response.error || response.message) {
      window.showInformationMessage(
        `${
          response.message
            ? response.message
            : 'Something went wrong, failed to refresh pull request'
        }`
      )
      return false
    }

    await PullRequestState.update({
      context,
      statusBar,
      isLogin: true,
      errorCount: { count: 0 },
    }) // refetch pull requests

    await Presence.set({
      status: PresenceStatus.Active,
      context,
      statusBar,
    })
    return true
  },
  setReminder: ({
    codeReview,
    context,
  }: {
    codeReview: CodeReviewSelectionItem
    context: ExtensionContext
  }) => {
    const onDidChangeSelection = async (item: readonly TimeSelectionItem[]) => {
      if (!item[0]?.label) return false
      const selectedTime = item[0]
      const session = await Authorization.currentSession(context)
      const duration = computeTime(selectedTime.value)
      const response = await PullRequestQuickActionsApi.setReminder({
        codeReviewId: codeReview.id,
        duration,
        authToken: session?.accessToken ?? '',
        context,
      })
      if (response.message || response.error || !response.success) {
        window.showInformationMessage(
          'Something went wrong, failed to set reminder'
        )
        return false
      }
      window.showInformationMessage(`Pullflow: Successfully set reminder.`)
      return true
    }

    timePicker({ title: 'Remind me in', onDidChangeSelection })
  },
}

const computeTime = (minutes: number) =>
  Math.floor(moment().add(minutes, 'minutes').valueOf() / 1000)
