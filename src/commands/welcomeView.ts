import { ExtensionContext } from 'vscode'
import { Welcome } from '../views/webviews/welcome/welcome'

export const WelcomeView = (context: ExtensionContext) => {
  Welcome.show(context)
}
