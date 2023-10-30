import { ExtensionContext, ViewColumn, Webview, window, Uri } from 'vscode'

const WelcomeView = {
  title: 'Welcome to Pullflow',
  type: 'welcome-view',
}

export const Welcome = {
  show: (context: ExtensionContext) => {
    const column = window.activeTextEditor?.viewColumn || ViewColumn.One
    const panel = window.createWebviewPanel(
      WelcomeView.type,
      WelcomeView.title,
      column
    )
    panel.iconPath = Uri.joinPath(context.extensionUri, 'assets/pullflow.png')
    panel.webview.html = Welcome.getHtml(panel.webview, context)
    panel.reveal(column)
  },

  getHtml: (webview: Webview, context: ExtensionContext) => {
    const assetsPath = webview.asWebviewUri(
      Uri.joinPath(context.extensionUri, 'assets')
    )
    const stylePath = webview.asWebviewUri(
      Uri.joinPath(
        context.extensionUri,
        'src/views/webviews/welcome/welcome.css'
      )
    )

    return `<!DOCTYPE html>
    <html lang="en">

    <head>
      <title>Welcome to Pullflow</title>

      <link rel="stylesheet" href=${stylePath} />
    </head>

    <body>
      <header>
        <img src="${assetsPath}/pullflow-logo.png" alt="Pullflow" />
        <div id="desc">
          <span>Code review collaboration across GitHub, Slack, and VS Code.</span>
        </div>
      </header>
      <section class="container">
        <section class="column">

          <div id="intro">
            <p> Pullflow is an AI-enhanced code review collaboration platform backed by the co-founder of GitHub and used by
              some of the most innovative dev teams, including <strong> Epic Games, Avenue, Hear.com,
                and RedwoodJS. </strong> </p>
            <p>
              It offers seamless integration with your <strong>Slack</strong> and <strong>GitHub </strong> accounts. Simply
              authenticate your accounts within Pullflow, and the
              synchronization will be automatically established. New to Pullflow? <a href="https://app.pullflow.com"> Sign
                In </a>
            </p>
          </div>
          <div>
            <img src="${assetsPath}/main.png" id="main-img" alt="Main" />
          </div>
          <div>
            <h3>Supercharge your workflow with Pullflow for VS Code</h3>
            <ul>
              <p>●&nbsp;&nbsp;&nbsp;Effortlessly communicate across GitHub, Slack, and VS Code.</p>
              <p>●&nbsp;&nbsp;&nbsp;Engage in meaningful conversations with contextual AI during PR discussions.</p>
              <p>●&nbsp;&nbsp;&nbsp;Stay fully engaged in your ongoing code reviews.</p>
              <p>●&nbsp;&nbsp;&nbsp;Stay updated in real-time on CI/CD and Automation.</p>
              <p>●&nbsp;&nbsp;&nbsp;Execute actions on your code reviews using natural language.</p>
            </ul>
          </div>
          <div>

            <h3>My Active Pull Requests</h3>
            <p><strong>PR Dashboard:</strong> Our extension equips VS Code with a PR Dashboard, offering a consolidated view
              of your active pull requests. It enables quick identification and focus on pull requests needing attention,
              all within VS Code Quick Pick.</p>
            <img src="${assetsPath}/pr-dashboard.png" id="pr-dashboard" alt="PR-Dashboard" />
          </div>
          <div>
            <h3>Quick Actions</h3>
            <p>The extension comes with a set of actions designed to help you take care of your code review tasks and return
              to your flow state. Actions you can take on pull request from VS Code are: </p>
            <ul>
              <li>&nbsp;&nbspOpen in Slack</li>
              <li>&nbsp;&nbspOpen in GitHub</li>
              <li>&nbsp;&nbspSend message to author/reviewer on Slack</li>
              <li>&nbsp;&nbspApprove pull request</li>
              <li>&nbsp;&nbspAdd labels on pull requests</li>
              <li>&nbsp;&nbspAdd reviewers on pull requests</li>
              <li>&nbsp;&nbspAdd assignees on pull requests</li>
            </ul>
            <div>
              <img src="${assetsPath}/pr-chat.gif" id="pr-dashboard" alt="PR-Chat-Image" />
            </div>
          </div>
        </section>
        <section class=column id="second-column">
          <div id="get-started-section">
            <h3>Get Started</h3>
            <div>
              <span> Pullflow is integrated with GitHub, Slack, and VS Code to help you merge PRs 4X faster. Here is
                how you can get started.</span>
            </div>
            <div>
              <ol>
                <li>Sign up on <a href="https://app.pullflow.com"> Pullflow</a> and connect your Slack and GitHub accounts.
                </li>
                <li> Click on <strong>Sign in to Pullflow</strong> from the VS Code status bar. </li>
                <li> Thats it! See statuses of your pull requests in status bar. </li>
                <ol>
            </div>
          </div>
          <div id="command-div">
            <h3>Commands</h3>
            <table>
              <tbody>
                <tr>
                  <td>Pullflow: Active Pull Requests (ctrl/cmd+Shift+,)</td>
                </tr>
                <tr>
                  <td>Pullflow: Login</td>
                </tr>
                <tr>
                  <td>Pullflow: Logout</td>
                </tr>
                <tr>
                  <td>Pullflow: Reconnect</td>
                </tr>
                <tr>
                  <td>Pullflow: Welcome</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div id="icon-div">
            <h3>Iconography</h3>
            <p>The extension offers a convenient way to quickly understand the status of your Pull Requests (PRs) at a
              glance. It provides an overview of your pull request life cycles using icon-based indicators.</p>
            <div>
              <img src="${assetsPath}/vs-code-icon.png" id="vs-code-icon" alt="Main" width="100%" height="100%" />
            </div>
          </div>
          <div>
            <h3>Become a Contributor</h3>
            <p>This extension is an open-source project created by <a href="https://github.com/pullflow">Pullflow Inc</a>.
              We encourage contributions, bug reports, and new feature suggestions. Feel free to fork the repository and add
              your own features.</p>
            <p>This is just the beginning of Pullflow's VS Code Slack integration, and we are eager to make improvements
              based on your feedback. Please don't hesitate to share your thoughts with us through <a
                href="https://github.com/gradience-io/kana/issues">GitHub issues</a> or on Twitter <a
                href="https://twitter.com/pullflow">@pullflow</a>.</p>
          </div>
        </section>
      </section>
      <footer id="footer">
        <i>This tool is designed by IDE-integration team at Pullflow for developers seeking a unified workspace that reduces
          context-switching and enhances productivity by integrating codebase management, code review, and team
          communication into a single interface. </i>
        </div>
      </footer>

    </html>`
  },
}
