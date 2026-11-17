This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

[![Harness](https://img.shields.io/badge/Harness-5%2F7_enforced-4682B4?style=flat-square)](HARNESS.md)

[Contributor onboarding](ONBOARDING.md)

## Available Scripts

In the project directory, you can run:s

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

#### Git-connected Vercel pipeline

The GitHub repository `bernhardwhy/shopping-app` is connected directly to the
Vercel project **shopping-app-67k0**. Deployment configuration lives in Vercel,
not in a GitHub Actions workflow or a checked-in `vercel.json`.

- [Vercel project and deployments](https://vercel.com/bernhardwhygmailcoms-projects/shopping-app-67k0)
- Push committed changes to GitHub; Vercel checks out the commit and starts a
  deployment. Local, uncommitted changes are not included.
- Branch deployments are previews. Historical production deployments use
  `master`; confirm the current Production Branch in Vercel before promoting
  changes.
- The project uses Vercel's **Create React App** preset. The repository build
  script runs `react-scripts build` and produces static assets in `build/`.
  Check Vercel's Build & Development Settings for command overrides; the inspected
  run failed before installation or the build command could execute.
- CircleCI is separate: its checked-in configuration runs tests and coverage,
  not deployment. No dependency between that test job and Vercel deployment
  was verified.

Before pushing, validate locally with the repository wrappers:

```powershell
node scripts\run_tests.js
node scripts\run_build.js
```

#### Current blocker (verified 2026-11-17)

The preview for branch `ae_onboarding`, commit
`7a979824646b57cd7c378c6a45c129395ea50826`, failed with
`BUILD_UTILS_NODE_VERSION_INVALID`:

> Found invalid or discontinued Node.js Version: "16.x". Please set Node.js Version to 26.x in your Project Settings to use Node.js 26.

[Inspect the failed deployment and build logs](https://vercel.com/bernhardwhygmailcoms-projects/shopping-app-67k0/4QWstHHa9zhZrUotx8gu4TgSGc8p).
The failure occurs after checkout, before dependency installation; it does not
establish whether application compilation or tests pass.

Recovery requires selecting a supported Node.js version in Vercel's project
settings and validating this old Create React App 3 toolchain with that version.
The version suggested by Vercel's error is not proof of application compatibility.
After the compatibility work, push a commit or explicitly redeploy, then verify
the matching commit, build logs, `READY` status, and preview page. No settings were
changed and no redeployment was triggered during this inspection.

#### Existing CLI-hosted page

The supplied [deployed page](https://build-7hod5h06u-bernhardwhy-gmailcom.vercel.app/)
is a different deployment: project **build-50uo**, deployment
`dpl_H12ZZjgRYbBLZ7MgENFtB7CAdytf`, source **cli**, status **READY**.
It has no Git commit metadata. The exact original CLI command is unknown.
Do not treat this URL as the current branch preview or assume Git pushes update it.

#### Inspecting deployments with Copilot

The workspace connects to Vercel through OAuth using
[`.vscode/mcp.json`](.vscode/mcp.json). See
[MCP instructions](.github/mcp-instructions.md) for authorization and the
read-only inspection workflow. Never put access tokens in the repository.

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
