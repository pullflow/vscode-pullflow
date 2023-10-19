/* eslint-disable @typescript-eslint/naming-convention */

export const IconReference = [
  'pr-open-icon',
  'draft-pr-icon',
  'review-icon',
  'approved-icon',
  'review-comment-icon',
  'request-changes-icon',
  'checks-running-icon',
  'checks-skipped-icon',
  'checks-passed-icon',
  'checks-failed-icon',
  'pr-open-icon',
  'draft-pr-icon',
  'review-icon',
  'approved-icon',
  'review-comment-icon',
  'request-changes-icon',
  'checks-running-icon',
  'checks-skipped-icon',
  'checks-passed-icon',
  'checks-failed-icon',
]

/** Map of pullflow icons to vs code icons */
export const PullRequestIconsMap: any = {
  '📥': {
    icon: 'pr-open-icon',
    description: 'Opened',
  },
  '📄': {
    icon: 'draft-pr-icon',
    description: 'Draft',
  },
  '🌐': {
    icon: 'pr-open-icon',
    description: 'Opened',
  },
  '🏷': {
    icon: 'pr-open-icon',
    description: 'Opened',
  },
  '🔘': {
    icon: 'pr-open-icon',
    description: 'Opened',
  },
  '🔄': {
    icon: 'pr-open-icon',
    description: 'Opened',
  },
  '🔍': {
    icon: 'review-icon',
    description: 'Review requested',
  },

  '🔙': {
    icon: 'pr-open-icon',
    description: 'Opened',
  },
  '👍': {
    icon: 'approved-icon',
    description: 'Approved',
  },
  '⌦': {
    icon: 'pr-open-icon',
    description: 'Opened',
  },
  '💬': {
    icon: 'review-comment-icon',
    description: 'Commented',
  },
  '✏️': {
    icon: 'request-changes-icon',
    description: 'Changes requested',
  },
  white_circle: {
    icon: 'checks-running-icon',
    description: 'Checks running',
  },
  large_yellow_circle: {
    icon: 'checks-skipped-icon',
    description: 'Checks skipped',
  },
  large_green_circle: {
    icon: 'checks-passed-icon',
    description: 'Checks passed',
  },
  red_circle: {
    icon: 'checks-failed-icon',
    description: 'Checks failed',
  },
  defaultIcon: {
    icon: 'pr-open-icon',
    description: 'Opened',
  },
}

export const PullRequestIcons = {
  getDescription: (icon: string) =>
    PullRequestIconsMap[icon]?.description ||
    PullRequestIconsMap.defaultIcon.description,

  getIcon: (icon: string) =>
    PullRequestIconsMap[icon]?.icon || PullRequestIconsMap.defaultIcon.icon,
}
