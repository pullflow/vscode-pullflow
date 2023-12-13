import { QuickPickItem } from 'vscode'

export type User = {
  username: string
  authToken: string
}
export type ChatChannel = {
  id: string
  name: string
  xid: string
}
export type CodeRepo = {
  id: string
  name: string
  chatChannel: ChatChannel
}
export type UserCodeReview = {
  id: string
  number: string
  title: string
  botReaction: string
  link: string // TODO: rename to codeLink
  createdAt: string
  author: { xid: string; hasUser: boolean }
  reviewers: { xid: string; hasUser: boolean }[]
  codeRepo: CodeRepo
  messageLink: string // TODO: rename to chatLink
  parentMessageXid: string
  repoChannelConnection: RepoChannelConnection
}

export type RepoChannelConnection = {
  id: string
  codeRepoId: String
  codeRepo: CodeRepo
  chatChannelId: string
  chatChannel: ChatChannel
}

export type CacheObject = {
  extensionId?: string
  pendingUserCodeReviews?: [UserCodeReview]
  userAuthoredCodeReviews?: [UserCodeReview]
  user?: User
  isFocused?: boolean // represents user focus on vscode
  lastFocusedTime?: number | null
  spaceUsers?: [SpaceUser]
  keyStrokeCount?: number
  lastKeyStrokeTime?: number | null
  previousPresenceStatus?: PresenceStatus
}
export enum StatusBarState {
  Loading,
  SignedIn,
  SignedOut,
  Error,
}
export enum DefaultRoute {
  GitHub = 'GitHub',
  Slack = 'Slack',
}
export interface CodeReviewSelectionItem extends QuickPickItem {
  link: {
    GitHub: string
    Slack: string
  }
  parentMessageXid: string
  chatChannelId: string
  id: string
  reviewers: { xid: string; hasUser: boolean }[]
  type: CodeReviewType
  author: { xid: string; hasUser: boolean }
  prNumber: string
}
export interface ReviewerSelectionItem extends QuickPickItem {
  hasUser: boolean
  xid: string
}
export interface SpaceUserSelectionItem extends QuickPickItem {
  label: string
  description: string
}
export enum CodeReviewType {
  Pending,
  Authored,
}
export enum ActivePullRequestActions {
  OpenInSlack = 'Open in Slack',
  OpenInGitHub = 'Open in GitHub',
  SendMessageInThread = 'Send a message in the pull request thread',
  SendMessageToAuthor = 'Message the author',
  SendMessageToReviewers = 'Message a reviewer',
  Approve = 'Approve',
  ApplyLabel = 'Add label',
  AddAssignee = 'Add assignee',
  RequestReview = 'Add reviewer',
  Refresh = 'Refresh',
  SetReminder = 'Set a reminder',
}
export type SpaceUser = {
  id: string
  name: string
  codeXid: string
}
export enum PresenceStatus {
  Inactive = 'Inactive',
  Active = 'Active',
  Flow = 'Flow',
  DND = 'DND',
}
export interface TimeSelectionItem extends QuickPickItem {
  value: number
}
export type ApiVariables =
  | ThreadMessageVariables
  | DirectMessageVariables
  | PresenceVariables
  | AddLabelsVariables
  | AddAssigneeVariables
  | RequestReviewVariables
  | CodeReviewApproveVariables
  | CodeReviewRemindersVariables
  | RefreshCodeReviewVariables
export type ThreadMessageVariables = {
  body: string
  parentMessageXid: string
  chatChannelId: string
}
export type DirectMessageVariables = {
  codeAccountXid: string
  codeReviewId: string
  codeReviewChatLink: string
  message: string
  fromAuthor: boolean
}
export type PresenceVariables = {
  status: PresenceStatus
  repoName?: string
  branch?: string
  eventProvider: string
}
export type AddLabelsVariables = {
  labels: string
  codeReviewId: string
  eventProvider: string
}
export type AddAssigneeVariables = {
  assigneeXid: string
  codeReviewId: string
  eventProvider: string
}
export type RequestReviewVariables = {
  reviewerXid: string
  codeReviewId: string
  eventProvider: string
}
export type CodeReviewApproveVariables = {
  codeReviewId: string
  body?: string
}
export type CodeReviewRemindersVariables = {
  codeReviewId: string
  duration: number
}
export type RepoInfo = {
  repoName?: string
  branch?: string
}
export type RefreshCodeReviewVariables = {
  codeReviewId: string
}
