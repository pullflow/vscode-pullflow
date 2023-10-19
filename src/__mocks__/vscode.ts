import { jest } from '@jest/globals'

export enum QuickPickItemKind {
  Default = 0,
  Description = 1,
  Separator = 2,
}

export const window = {
  showInformationMessage: jest.fn(),
}
