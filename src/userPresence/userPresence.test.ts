import { describe, expect, it, jest } from '@jest/globals'
import { PresenceStatus } from '../utils'

describe('User Presence', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('updates user presence to flow when user has typed enough keys and was not in flow before', async () => {
    mockAuthorization.Authorization.currentSession.mockReturnValue({})
    mockStore.Store.get.mockReturnValue({
      keyStrokeCount: 50,
      lastFocusedTime: 0,
      lastKeyStrokeTime: new Date().getTime(),
      isFocused: true,
      previousPresenceStatus: 'INACTIVE',
    })
    await subject().update(mockContext)
    expect(mockPresence.Presence.set).toHaveBeenCalledWith({
      context: mockContext,
      status: PresenceStatus.Flow,
    })
  })

  it('updates user presence to active when user has not typed anything in a while and was not active before', async () => {
    mockAuthorization.Authorization.currentSession.mockReturnValue({})
    mockStore.Store.get.mockReturnValue({
      keyStrokeCount: 0,
      lastFocusedTime: new Date().getTime() - 100000,
      isFocused: true,
      previousPresenceStatus: 'INACTIVE',
    })
    await subject().update(mockContext)
    expect(mockPresence.Presence.set).toHaveBeenCalledWith({
      context: mockContext,
      status: PresenceStatus.Active,
    })
  })
})

export {}
const subject = () => {
  jest.mock('../utils/store', () => mockStore)
  jest.mock('../utils/authorization', () => mockAuthorization)
  jest.mock('../models/presence', () => mockPresence)
  jest.mock('../utils/logger', () => ({ log: { info: jest.fn() } }))
  return require('./userPresence').UserPresence
}

const mockStore = {
  Store: {
    get: jest.fn(),
    set: jest.fn(),
  },
}

const mockAuthorization = {
  Authorization: {
    currentSession: jest.fn(),
  },
}

const mockPresence = {
  Presence: {
    set: jest.fn(),
  },
}

const mockContext = {
  globalState: {
    get: jest.fn(),
    update: jest.fn(),
  },
}
