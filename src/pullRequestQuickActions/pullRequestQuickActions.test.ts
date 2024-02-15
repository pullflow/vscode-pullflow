import { describe, expect, it, jest } from '@jest/globals'
import { window } from '../__mocks__/vscode'

describe('Pull Request Quick Actions', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    mockAuthorization.Authorization.currentSession.mockReturnValue(mockSession)
  })
  it('applies labels to pull request', async () => {
    const mockLabel = 'mock_label'
    window.showInputBox.mockReturnValue(mockLabel)
    await subject().applyLabel({
      codeReview: mockModel,
      context: mockModel,
      statusBar: mockStatusBar,
    })
    expect(mockPresence.Presence.set).toBeCalled()
    expect(mockPullRequestState.PullRequestState.updateWithDelay).toBeCalled()
  })

  it('approves pull request', async () => {
    const mockText = 'mock_approve'
    window.showInputBox.mockReturnValue(mockText)
    await subject().approve({
      codeReview: mockModel,
      context: mockModel,
      statusBar: mockStatusBar,
    })
    expect(
      mockPullRequestQuickActionsApi.PullRequestQuickActionsApi.approve
    ).toHaveBeenCalledWith({
      body: mockText,
      codeReviewId: mockModel.id,
      authToken: mockSession.accessToken,
      context: mockModel,
    })
    expect(mockPresence.Presence.set).toBeCalled()
    expect(mockPullRequestState.PullRequestState.updateWithDelay).toBeCalled()
  })

  it('adds assignee to pull request', async () => {
    mockSpaceUsers.SpaceUsers.get.mockReturnValue([])
    await subject().addAssignee({
      codeReview: mockModel,
      context: mockModel,
      statusBar: mockStatusBar,
    })
    expect(mockSpaceUserPicker.spaceUserPicker).toBeCalledWith(
      expect.objectContaining({
        context: mockModel,
        placeholder: 'Select a user',
        title: 'Add assignee to pull request',
        spaceUsers: [],
      })
    )
    expect(mockPresence.Presence.set).toBeCalled()
    expect(mockPullRequestState.PullRequestState.updateWithDelay).toBeCalled()
  })

  it('adds reviewer on pull request', async () => {
    mockSpaceUsers.SpaceUsers.get.mockReturnValue([])
    await subject().requestReview({
      codeReview: mockModel,
      context: mockModel,
      statusBar: mockStatusBar,
    })
    expect(mockSpaceUserPicker.spaceUserPicker).toBeCalledWith(
      expect.objectContaining({
        context: mockModel,
        placeholder: 'Select a user',
        title: 'Add reviewer to pull request',
        spaceUsers: [],
      })
    )
    expect(mockPresence.Presence.set).toBeCalled()
    expect(mockPullRequestState.PullRequestState.updateWithDelay).toBeCalled()
  })
})

export {}
const subject = () => {
  jest.mock('../utils/authorization', () => mockAuthorization)
  jest.mock(
    '../api/pullRequestQuickActionsApi',
    () => mockPullRequestQuickActionsApi
  )
  jest.mock('../models/presence', () => mockPresence)
  jest.mock('../utils/pullRequestsState', () => mockPullRequestState)
  jest.mock('../views/quickpicks/spaceUserPicker', () => mockSpaceUserPicker)
  jest.mock('../views/quickpicks/timePicker', () => mockTimerPicker)
  jest.mock('../models/spaceUsers', () => mockSpaceUsers)
  return require('./pullRequestQuickActions').PullRequestQuickActions
}

const mockAuthorization = {
  Authorization: {
    currentSession: jest.fn(),
  },
}
const mockPullRequestQuickActionsApi = {
  PullRequestQuickActionsApi: {
    addLabels: jest.fn(),
    approve: jest.fn(),
  },
}
const mockPresence = {
  Presence: {
    set: jest.fn(),
  },
}
const mockPullRequestState = {
  PullRequestState: {
    update: jest.fn(),
    updateWithDelay: jest.fn(),
  },
}
const mockSpaceUsers = {
  SpaceUsers: {
    get: jest.fn(),
  },
}
const mockSpaceUserPicker = {
  spaceUserPicker: jest.fn(),
}
const mockStatusBar = {
  text: 'mock_status_bar',
}
const mockModel = {
  id: '1',
}
const mockSession = {
  accessToken: 'mock_access_token',
}
const mockTimerPicker = {
  timePicker: jest.fn(),
}
