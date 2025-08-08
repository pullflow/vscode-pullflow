import * as path from "path"

/** Get the full path of a filename from root */
const rootPath = (filename: string) => path.resolve(__dirname, `../${filename}`)

require("dotenv").config({ path: rootPath(".env") })

// Helper to read from env with a safe default so production doesn't require a .env file
const fromEnv = (key: string, fallback: string): string => {
  const val = process.env[key]
  return typeof val === "string" && val.length > 0 ? val : fallback
}

export const AppConfig = {
  app: {
    // Key name for VS Code SecretStorage. Not a credential; safe to default.
    sessionSecret: fromEnv("SESSIONS_SECRET_KEY", "pullflow.session"),
    // Public identifier for the client used during auth redirects.
    clientIdentifier: fromEnv("CLIENT_IDENTIFIER", "com.pullflow.vscode"),
  },
  pullflow: {
    // Public service endpoints; default to production URLs.
    baseUrl: fromEnv("PULLFLOW_APP_URL", "https://app.pullflow.com"),
    graphqlUrl: `${fromEnv(
      "PULLFLOW_APP_URL",
      "https://app.pullflow.com"
    )}/api/graphql`,
    telemetryUrl: fromEnv(
      "PULLFLOW_TELEMETRY_URL",
      "https://collector.pullflow.cloud"
    ),
  },
}
