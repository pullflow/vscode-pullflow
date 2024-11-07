import { log } from '../utils/logger'
import { ExtensionContext } from 'vscode'
import { PullflowApi } from '../utils/pullflowApi'

const module = 'pullRequestQuickActionsApi.ts'
const eventProvider = 'VSCode'

const ADD_LABELS = `
  mutation addLabelsToCodeReview($labels: String!, $codeReviewId: String!, $eventProvider: EventProvider!){
    addLabelsToCodeReview(labels: $labels, codeReviewId: $codeReviewId, eventProvider: $eventProvider) {
      success
      message
    }
  }
`

const APPROVE_CODE_REVIEW = `
  mutation approveCodeReview($codeReviewId: String!, $body: String, $eventProvider: EventProvider!) {
    approveCodeReview(codeReviewId: $codeReviewId, body: $body, eventProvider: $eventProvider){
      success
      message
    }
}

`
const ADD_ASSIGNEE = `
  mutation addAssigneeToCodeReview($assigneeXid: String!, $codeReviewId: String!, $eventProvider: EventProvider!)  {
	  addAssigneeToCodeReview(assigneeXid: $assigneeXid, codeReviewId: $codeReviewId, eventProvider: $eventProvider){
		  success
		  message
	  }
}
`

const REQUEST_REVIEW = `
  mutation requestReview($reviewerXid: String!, $codeReviewId: String!, $eventProvider: EventProvider) {
    requestReview(reviewerXid: $reviewerXid,  codeReviewId: $codeReviewId, eventProvider: $eventProvider){
      success
      message
    }
  }
`

const REFRESH_CODE_REVIEW = `
mutation refreshCodeReview($codeReviewId: String!) {
  refreshCodeReview(codeReviewId: $codeReviewId) {
    success
    message
  }
}
`

const SET_REMINDER = `
mutation setCodeReviewReminder($codeReviewId: String!, $duration: Int!) {
  setCodeReviewReminder(codeReviewId: $codeReviewId, duration: $duration) {
    success
    message
  }
}
`

export const PullRequestQuickActionsApi = {
  addLabels: async ({
    accessToken,
    labels,
    codeReviewId,
    context,
  }: {
    accessToken: string
    labels: string
    codeReviewId: string
    context: ExtensionContext
  }) => {
    log.info(`adding labels to pull request: ${{ labels }}}`, module)

    const pullflowApi = new PullflowApi(context, accessToken)
    try {
      const data = await pullflowApi.fetch(ADD_LABELS, {
        labels,
        codeReviewId,
        eventProvider,
      })
      return data.addLabelsToCodeReview
    } catch (error) {
      log.error(`error in adding label, ${error}`, module)
      return { error }
    }
  },

  approve: async ({
    accessToken,
    codeReviewId,
    body,
    context,
  }: {
    accessToken: string
    codeReviewId: string
    body: string
    context: ExtensionContext
  }) => {
    log.info(`approving pull request: ${{ codeReviewId }}}`, module)

    const pullflowApi = new PullflowApi(context, accessToken)
    try {
      const data = await pullflowApi.fetch(APPROVE_CODE_REVIEW, {
        codeReviewId,
        body,
        eventProvider,
      })
      return data.approveCodeReview
    } catch (error) {
      log.error(`error in approving, ${error}`, module)
      return { error }
    }
  },

  addAssignee: async ({
    accessToken,
    codeReviewId,
    assigneeXid,
    context,
  }: {
    accessToken: string
    codeReviewId: string
    assigneeXid: string
    context: ExtensionContext
  }) => {
    log.info(`add assignee to pull request: ${{ assigneeXid }}}`, module)

    const pullflowApi = new PullflowApi(context, accessToken)
    try {
      const data = await pullflowApi.fetch(ADD_ASSIGNEE, {
        codeReviewId,
        assigneeXid,
        eventProvider,
      })
      return data.addAssigneeToCodeReview
    } catch (error) {
      log.error(`error in approving, ${error}`, module)
      return { error }
    }
  },

  requestReview: async ({
    codeReviewId,
    reviewerXid,
    accessToken,
    context,
  }: {
    codeReviewId: string
    reviewerXid: string
    accessToken: string
    context: ExtensionContext
  }) => {
    log.info(`requesting review: ${{ reviewerXid }}}`, module)

    const pullflowApi = new PullflowApi(context, accessToken)
    try {
      const data = await pullflowApi.fetch(REQUEST_REVIEW, {
        codeReviewId,
        reviewerXid,
        eventProvider,
      })
      return data.requestReview
    } catch (error) {
      log.error(`error in requesting review, ${error}`, module)
      return { error }
    }
  },

  refresh: async ({
    codeReviewId,
    accessToken,
    context,
  }: {
    codeReviewId: string
    accessToken: string
    context: ExtensionContext
  }) => {
    log.info(`requesting review: ${{ codeReviewId }}}`, module)

    const pullflowApi = new PullflowApi(context, accessToken)
    try {
      const data = await pullflowApi.fetch(REFRESH_CODE_REVIEW, {
        codeReviewId,
      })
      return data.refreshCodeReview
    } catch (error) {
      log.error(`error in requesting review, ${error}`, module)
      return { error }
    }
  },

  setReminder: async ({
    duration,
    codeReviewId,
    accessToken,
    context,
  }: {
    duration: number
    codeReviewId: string
    accessToken: string
    context: ExtensionContext
  }) => {
    log.info(`setting reminder: ${{ duration, codeReviewId }}}`, module)

    const pullflowApi = new PullflowApi(context, accessToken)
    try {
      const data = await pullflowApi.fetch(SET_REMINDER, {
        codeReviewId,
        duration,
      })
      return data.setCodeReviewReminder
    } catch (error) {
      log.error(`error in requesting review, ${error}`, module)
      return { error }
    }
  },
}
