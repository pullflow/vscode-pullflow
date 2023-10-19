import { window } from 'vscode'

const outputChannel = window.createOutputChannel('Pullflow')

const logMessage = (level: string, text: string, module: string) =>
  outputChannel.append(
    `[${level} - ${new Date()} module: ${module}] ${text} \n`
  )

export const log = {
  info: (text: string, module: string) => logMessage('info', text, module),
  warn: (text: string, module: string) => logMessage('warn', text, module),
  error: (text: string, module: string) => logMessage('error', text, module),
}
