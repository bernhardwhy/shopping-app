This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

[![Harness](https://img.shields.io/badge/Harness-5%2F7_enforced-4682B4?style=flat-square)](HARNESS.md)

[Contributor onboarding](ONBOARDING.md)

## Shopping list

- **Einkaufsliste** shows the outstanding-item count and a compact checklist,
  grouped by category. Missing or unknown categories appear under **Sonstiges**.
- Filter by **Alle**, **Ohne Markt**, **Hofer**, **Billa**, **Lidl**, **Bauhaus**,
  or **Biohof**.
  Counts include outstanding items only; empty markets remain selectable.
  Each app load starts at **Alle**.
- Use the square action beside an item to mark it bought in the shared list.
  Completing one market names that market, not the entire shopping trip.
- **Bearbeiten** opens name/category/market editing. Changes save immediately;
  **Fertig** exits editing, rather than submitting a separate save.
- **Hinzufügen** opens full-screen search. Select a previously bought item to
  re-add it, or enter a nonblank name to create an item, even beside matches.
  New items default to the selected market, or **Ohne Markt** from **Alle**.
  Re-adds keep their saved market unless you deliberately change the selector;
  the action and success message show the destination. Active matches cannot
  be re-added.
- Purchase/market changes and count contributions wait for Firebase write
  acknowledgment. Failed writes show an error and retain retryable input.
  Unrelated realtime changes continue updating.
- The warm-neutral/green layout supports narrow screens, visible keyboard focus,
  and reduced motion. The fixed add action leaves room to reach the last item.

All entries share one Firebase list, with one optional `marketId` per item.
Missing/null or unknown markets appear in **Ohne Markt**; unknown values can be
repaired in editing. No migration or custom market management is included.

**Before release:** the authorized Firebase project owner must verify deployed
rules accept the optional market field, supported IDs, and null clearing.
Rules are external to this repository; local validation uses synthetic data,
not the shared database.

## Available Scripts

Use Node.js 22.x. Install the locked dependencies from the public npm registry:

```powershell
node scripts\run_installpackages.js
```

This runs `npm ci`; dependency changes must include an updated `package-lock.json`.
Use the repository wrappers for local validation and development:

```powershell
node scripts\run_tests.js
node scripts\run_build.js
node scripts\run_start.js
```

The underlying npm scripts are described below.

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
Vercel project **shopping-app-67k0**. Checked-in [`vercel.json`](vercel.json)
defines installation, test/build commands, framework, and output directory.
[`package.json`](package.json) and the Vercel project settings select Node.js 22.x.

**Stable app URL: https://shopping-app-pi.vercel.app**

Share this production domain, not a deployment-specific preview URL. The domain
is already attached to this project and has no branch override. A successful
production deployment updates it automatically; failed builds do not publish.
At repair verification, this domain returned `404 DEPLOYMENT_NOT_FOUND` because
there was no usable production deployment. The fix is verified on a feature
preview first; merge it into `master` to publish the repaired app at this domain.

- [Vercel project and deployments](https://vercel.com/bernhardwhygmailcoms-projects/shopping-app-67k0)
- Push committed changes to GitHub; Vercel checks out the commit and starts a
  deployment. Local, uncommitted changes are not included.
- Feature branches deploy as previews; `master` deploys to production. Review the
  preview, then merge the feature branch into `master` to publish to the stable URL.
- Vercel runs `node scripts/run_installpackages.js` (`npm ci`), then
  `node scripts/run_tests.js && node scripts/run_build.js`. A failing test or build
  blocks publication. Create React App produces the static assets in `build/`.
- No CLI upload or manual domain reassignment is needed for normal releases.
- The service worker precaches the app shell for offline use. Existing tabs retain
  their current version until closed; close all app tabs and reopen after a release
  if an installed app still shows cached content. Firebase data still needs network
  access. The web manifest launches `/` on the current deployment's origin.
- CircleCI is separate and is not the deployment gate. Its legacy Node 8
  configuration is not compatible with this toolchain; it is not modernized here.

Before pushing, validate locally with the repository wrappers:

```powershell
node scripts\run_tests.js
node scripts\run_build.js
```

#### Build compatibility

The former Node.js 16 setting was rejected by Vercel before installation.
Node.js 22 also exposed webpack 4's OpenSSL incompatibility and the old Firebase
SDK's native gRPC dependency. The pipeline repair uses Create React App 5.0.1
(webpack 5), TypeScript 4.9.5, and Firebase 8.10.1's existing namespaced API.
React 16 and the app's UI/data model are unchanged. No legacy OpenSSL flag,
disabled type checks, or ignored CI warnings are required.
[`src/service-worker.js`](src/service-worker.js) restores CRA's opt-in Workbox
precache generation so the existing registration and offline app shell keep working.

To investigate a failure, match the deployment's Git SHA to the pushed commit and
read its build logs. A local green build alone does not verify cloud deployment.
After a production release, check the stable URL in a browser and confirm grocery
data loads; Firebase access is external to Vercel and component tests mock it.

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
