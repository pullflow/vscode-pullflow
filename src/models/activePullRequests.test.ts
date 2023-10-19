import { describe, expect, it, jest } from '@jest/globals'

describe('activePullRequests', () => {
  it('gets active pull requests for user', async () => {
    mockActivePullRequestsApi.ActivePullRequestsApi.getCodeReviews.mockReturnValue(
      {
        codeReviews: mockCodeReviews,
      }
    )
    const outcome = await subject().get('token')
    expect(outcome).toEqual({
      data: { codeReviews: mockCodeReviews },
    })
  })

  it('does not get active pull requests when invalid access token', async () => {
    mockActivePullRequestsApi.ActivePullRequestsApi.getCodeReviews.mockReturnValue(
      {
        message: 'Invalid access token',
      }
    )
    const outcome = await subject().get('token')
    expect(outcome).toEqual({
      error: 'Invalid access token',
      requireRelogin: true,
    })
  })
})

export {}
const subject = () => {
  jest.mock('../api/activePullRequestApi', () => mockActivePullRequestsApi)
  return require('./activePullRequests').ActivePullRequests
}
const mockActivePullRequestsApi = {
  ActivePullRequestsApi: {
    getCodeReviews: jest.fn(),
  },
}
const mockCodeReviews = [{ id: '1' }, { id: '2' }]
