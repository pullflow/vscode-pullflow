import { ExtensionContext, ViewColumn, Webview, window, Uri } from "vscode"

const WelcomeView = {
  title: "Welcome to PullFlow",
  type: "welcome-view",
}

export const Welcome = {
  show: (context: ExtensionContext) => {
    const column = window.activeTextEditor?.viewColumn || ViewColumn.One
    const panel = window.createWebviewPanel(
      WelcomeView.type,
      WelcomeView.title,
      column
    )
    panel.iconPath = Uri.joinPath(context.extensionUri, "assets/pullflow.png")
    panel.webview.html = Welcome.getHtml(panel.webview, context)
    panel.reveal(column)
  },

  getHtml: (webview: Webview, context: ExtensionContext) => {
    const assetsPath = webview.asWebviewUri(
      Uri.joinPath(context.extensionUri, "assets")
    )
    const stylePath = webview.asWebviewUri(
      Uri.joinPath(context.extensionUri, "styles/welcome.css")
    )

    return `<!DOCTYPE html>
    <html lang="en">

    <head>
      <title>Welcome to PullFlow</title>

      <link rel="stylesheet" href=${stylePath} />
    </head>

    <body>
      <header>
        <img src="${assetsPath}/pullflow-logo.png" alt="PullFlow" />
        <div id="desc">
          <p>AI-enhanced code review collaboration across GitHub, Slack, and VS Code.</p>
        </div>
      </header>
      <section class="container">
        <section class="column">

          <div id="intro">
            <p>PullFlow is an AI-enhanced code review collaboration platform backed by GitHub's co-founder and trusted by
              innovative development teams at <strong>Epic Games, Avenue, Dispatch, Vault.fm, and Composio.</strong></p>
            <p>Connect your GitHub, Slack, and VS Code accounts with PullFlow to enable seamless bidirectional sync. New to PullFlow? <a
                href="https://pullflow.com">Sign up for free.</a>
            </p>
          </div>
          <div>
            <img src="${assetsPath}/main.png" id="main-img" alt="Main" />
          </div>
          <div>
            <h3>Supercharge Your VS Code Workflow</h3>
            <ul>
              <li>&nbsp;&nbsp;&nbsp;Communicate seamlessly across GitHub, Slack, and VS Code</li>
              <li>&nbsp;&nbsp;&nbsp;Engage in AI-powered conversations during PR discussions</li>
              <li>&nbsp;&nbsp;&nbsp;Stay focused on your active code reviews</li>
              <li>&nbsp;&nbsp;&nbsp;Receive real-time updates on CI/CD pipelines and automation</li>
              <li>&nbsp;&nbsp;&nbsp;Execute pull request actions using natural language commands</li>
            </ul>
          </div>
          <div>

            <h3>Active Pull Requests Dashboard</h3>
            <p><strong>Centralized PR Management:</strong> The extension provides VS Code with a comprehensive PR Dashboard that consolidates all your active pull requests in one view. Quickly identify and prioritize pull requests that need your attention, all accessible through VS Code's Quick Pick interface.</p>
            <img src="${assetsPath}/pr-dashboard.png" id="pr-dashboard" alt="PR-Dashboard" />
          </div>
          <div>
            <h3>Quick Actions</h3>
            <p>Streamline your code review workflow with powerful actions designed to help you complete tasks efficiently and maintain your flow state. Available pull request actions include:</p>
            <ul>
              <li>&nbsp;&nbsp;Open in Slack</li>
              <li>&nbsp;&nbsp;Open in GitHub</li>
              <li>&nbsp;&nbsp;Send message to author/reviewer on Slack</li>
              <li>&nbsp;&nbsp;Approve pull request</li>
              <li>&nbsp;&nbsp;Add labels to pull requests</li>
              <li>&nbsp;&nbsp;Add reviewers to pull requests</li>
              <li>&nbsp;&nbsp;Add assignees to pull requests</li>
            </ul>
            <div>
              <img src="${assetsPath}/pr-chat.gif" id="pr-dashboard" alt="PR-Chat-Image" />
            </div>
          </div>
          <div id="icon-div">
          <h3>Visual Status Indicators</h3>
          <p>Understand your pull request status at a glance with intuitive icon-based indicators. The extension provides a visual overview of your pull request lifecycle, making it easy to track progress and identify actionable items.</p>
          <div>
            <img src="${assetsPath}/vs-code-icon.png" id="vs-code-icon" alt="Main" width="100%" height="100%" />
          </div>
        </div>
        </section>
        <section class=column id="second-column">
          <div id="get-started-section">
            <h3>Get Started</h3>
            <div>
              <span>PullFlow integrates GitHub, Slack, and VS Code to help you merge pull requests 4x faster. Here's how to get started:</span>
            </div>
            <div>
              <ol>
                <li>Sign up on <a href="https://app.pullflow.com">PullFlow</a> and connect your Slack and GitHub accounts</li>
                <li>Click <strong>Sign in to PullFlow</strong> from the VS Code status bar</li>
                <li>That's it! Your incoming pull requests will appear on the status bar</li>
                <ol>
            </div>
          </div>
          <div id="command-div">
            <h3>Commands</h3>
            <table>
              <tbody>
                <tr>
                  <td>PullFlow: Active Pull Requests (Ctrl/Cmd+Shift+,)</td>
                </tr>
                <tr>
                  <td>PullFlow: Sign in</td>
                </tr>
                <tr>
                  <td>PullFlow: Sign out</td>
                </tr>
                <tr>
                  <td>PullFlow: Reconnect</td>
                </tr>
                <tr>
                  <td>PullFlow: Welcome</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <h3>Become a Contributor</h3>
            <p>This extension is an open-source project created by <a href="https://github.com/pullflow">PullFlow Inc</a>.
              We welcome contributions, bug reports, and feature requests. Feel free to fork the repository and contribute your own enhancements.</p>
            <p>This is just the beginning of PullFlow's VS Code extension journey, and we're committed to continuous improvement
              based on your feedback. Share your thoughts with us through <a
                href="https://github.com/pullflow/pullflow/issues">GitHub Issues</a> or follow us on Twitter <a
                href="https://twitter.com/pullflow">@pullflow</a>.</p>
          </div>
        </section>
      </section>
      <footer id="footer">
        <p>&copy; 2025 PullFlow Inc. | <a href="https://pullflow.com">pullflow.com</a> | <a href="https://github.com/pullflow/vscode-pullflow">GitHub</a></p>
      </footer>

    </html>`
  },
}
