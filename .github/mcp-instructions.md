# MCP Instructions

This file contains instructions for how and when to use selected MCPs.

## Vercel

The workspace configures Vercel's official remote MCP server in
[`../.vscode/mcp.json`](../.vscode/mcp.json).

In VS Code, run **MCP: List Servers**, select **vercel**, and start the server.
Complete the browser sign-in and authorize access to the team that owns this
project. Credentials are managed through OAuth; do not add tokens to the repository.

After authorization, list teams and projects to verify access, then use deployment
details and build logs to investigate the frontend pipeline. Confirm the project
matches this repository before taking action. Do not deploy, redeploy, or change
project settings without an explicit user request.

### Deployment inspection

- Git-linked frontend project: `shopping-app-67k0`
  (`prj_vSLUZKtyl3osqRvpIRk1KXESh0QT`), linked to
  `bernhardwhy/shopping-app`.
- Use `get_git_deployment_context` to discover the authorized team, and pass its
  `teamId` explicitly on project and deployment requests.
- On a team-access `403`, call `authorize_team_access` with the returned team ID,
  show the one-use approval link to the user, and retry after approval. Reconnecting
  is not necessary.
- Read the local Git branch and HEAD SHA. Use `list_deployments` filtered to this
  project and branch, then compare the deployment's commit SHA with HEAD.
- Use `get_deployment` for status and source metadata, and
  `list_deployment_events` with `builds: 1` for build logs. Report the exact failure
  and whether installation, compilation, or tests actually ran.
- The older `build-7hod5h06u-bernhardwhy-gmailcom.vercel.app` URL belongs to a
  separate CLI deployment in `build-50uo`; it is not the Git-linked branch preview.

The stable production domain is `https://shopping-app-pi.vercel.app`; verify its
deployment after a master release instead of sharing a preview-specific hostname.

See the [README deployment section](../README.md#deployment) for the release
process and build compatibility decisions. Keep it current when deployment configuration changes.
