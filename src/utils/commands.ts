import { isDevelopment } from './appConfig'

const Commands = {
  signIn: 'pullflow.signIn',
  activePullRequests: 'pullflow.active-pull-requests',
  signOut: 'pullflow.signOut',
  reconnect: 'pullflow.reconnect',
  toggleFlowState: 'pullflow.toggle-flow-state',
  welcomeView: 'pullflow.welcome-view',
}

export const Command = (key: keyof typeof Commands) => {
  return isDevelopment()
    ? Commands[key].replace('pullflow', 'pullflow-dev')
    : Commands[key]
}
