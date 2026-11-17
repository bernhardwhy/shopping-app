# Architecture

## High-Level Overview

- **Purpose**: A browser-based grocery list for viewing, searching, adding, categorizing, and marking grocery items as bought.
- **Languages**: TypeScript (4.9.5), JavaScript, and CSS.
- **Frameworks and libraries**: React 16.8.6, Create React App / `react-scripts` 5.0.1, Material-UI 4, and Firebase SDK 8.10.1.
- **Package manager**: npm; dependencies and scripts are declared in `package.json` and `package-lock.json`.
- **Persistence**: Firebase Realtime Database, accessed through the Firebase client SDK. There is no project-owned backend or local database service.
- **Local development**: Use Node.js 22.x, install with `node scripts/run_installpackages.js`, and start with `node scripts/run_start.js`. The app needs network access and a reachable Firebase database for grocery data.

## Architecture

### Style and building blocks

The application is a single-page React client. `src/index.tsx` mounts `App` and registers the service worker. CRA injects the build's asset manifest into `src/service-worker.js` for Workbox app-shell precaching. Firebase responses are not cached by this worker. `App` owns grocery-list state and Firebase reads and writes. `GroceryList` renders and edits items; `SearchDialog` filters existing items and adds new ones. `GroceryType` describes grocery records.

Components communicate through props and callbacks. Firebase access is concentrated in `App` and initialized in `src/shared/config.tsx`; there is no separate repository or service layer.

`App` provides the Material-UI theme, the Einkaufsliste header/outstanding count,
read/loading feedback, and the persistent add action. The layout is a centered
single column, capped at 720px, with warm-neutral surfaces and a green accent.
`GroceryList` groups compact checklist rows by the existing category identifiers
without mutating its input. Missing/unknown categories display as Sonstiges.
List-wide name/category/market editing saves changes immediately; Fertig only
exits editing. Failed edits retain drafts and an actionable retry.
If a category edit moves a focused field between sections, the list restores
focus to that field. After an acknowledged market assignment removes the focused
row, focus moves to the selected filter; deliberate focus elsewhere is preserved.
`SearchDialog` retains the full-screen search/re-add/create workflow, with
matching styling and reduced-motion-aware transitions.
App/list styles remain CSS classes; dialog styles remain MUI `makeStyles`.

### Runtime and data flow

On mount, `App` subscribes to the Firebase `/groceries` value. It maps the returned
records into grocery items. `src/markets.ts` holds the fixed catalog and pure
outstanding-item filter/count helpers. App derives both the selected view and
all market/filter counts from the effective collection, rather than maintaining a second
outstanding array. Selection starts at Alle and stays local to the mounted app.
Search uses literal, case-insensitive matches over the whole collection.

Stored `marketId` is optional: `hofer`, `billa`, `lidl`, `bauhaus`, or `biohof`; missing/null
means unassigned. Unknown IDs are grouped as unassigned without rewriting them,
with an explicit repair choice in editing. Clearing writes null; UI filter
sentinels are never stored. The existing `buyed` and category identifiers remain
unchanged; `area` is also optional to reflect existing uncategorized records.

An empty/null collection maps to an empty list. Record IDs come from Firebase
keys without mutating snapshot records. Retrying replaces the value listener;
unmounting detaches it. A successful snapshot clears any prior read error.
Write callbacks return promises. App registers per-record purchase/market
overlays before narrow SDK updates. Value events can be local optimistic writes,
so only the affected membership fields retain their pre-write displayed values
until acknowledgment; unrelated snapshot fields/records keep updating.
Overlapping membership writes on the same record are rejected explicitly.
On rejection, masks remain until rollback reconciliation, while the originating
UI retains input and offers retry. No old whole-collection snapshot is restored.
Creation allocates a key with `push()` before `set(...)`, hiding optimistic new
records from counts/history until acknowledgment and suppressing rejected records
until rollback. Name/category writes remain immediate narrow updates.

The dialog defaults new items from the selected store (otherwise unassigned).
Re-adds omit the market field unless the selector was deliberately changed.
Active matches are disabled; a trimmed nonblank create action remains available
beside matches. Success is destination-aware and acknowledged; failed drafts
and their destination survive closing/reopening for retry.
Completion is triggered by an acknowledged purchase emptying its selected view,
not navigation, remote snapshots, or market reassignment. Store completion names
the store and keeps filters reachable.

### Security and configuration

Firebase client configuration is located in `src/shared/config.tsx`; configuration values are intentionally omitted here. The browser communicates directly with Firebase. No application authentication flow or database security rules are defined in this repository, so access control and rule enforcement must be verified in the Firebase project configuration.

### Testing and delivery

Tests use Jest through Create React App. `src/App.test.tsx`,
`src/GroceryList/GroceryList.test.tsx`, and
`src/SearchDialog/SearchDialog.test.tsx` use ReactDOM render/unmount and
`act`/`Simulate`, plus pure helper tests in `src/markets.test.ts`. The 35 tests cover
counts/filtering, legacy/null/unknown values, realtime snapshots, optimistic
events before acknowledgment, rejection/rollback ordering, retry, scoped
completion, focus, destination rules, literal search, and edit draft retention.
React 16.8 only provides synchronous `act`; promise continuations in hook tests
can emit development `act` warnings despite awaited assertions.
Firebase is mocked in App tests;
no live Firebase integration tests or coverage threshold are configured.
Validate with `node scripts\run_tests.js` and `node scripts\run_build.js`.
For one suite on Windows, pass a basename such as
`node scripts\run_tests.js GroceryList.test.tsx`; the selector is a Jest pattern,
not a Windows filesystem path.

Vercel's Git integration deploys feature branches as previews and `master` as production. `vercel.json` runs a locked dependency install, component tests, and the production build. Static output is served at the stable production domain, `https://shopping-app-pi.vercel.app`. Firebase remains the browser's external data service.

The separate legacy CircleCI configuration uses Node 8 and is not compatible with the current toolchain. It is not the Vercel deployment gate.

### ADR: Supported Node.js build without a UI migration

- **Status**: Accepted for the pipeline repair.
- **Context**: Vercel rejects Node.js 16. On Node.js 22, CRA 3's webpack 4 fails with an OpenSSL error and Firebase 6's native gRPC dependency is incompatible.
- **Decision**: Use Node.js 22, CRA 5/webpack 5, TypeScript 4.9, and Firebase 8's namespaced API. Keep React 16, component ownership, Firebase configuration, and the grocery data model unchanged. Install from the public npm registry with `npm ci`; run tests before every Vercel build.
- **Consequences**: The app builds without legacy crypto flags or disabled checks. These remain legacy application dependencies, not a full modernization. Firebase access rules and runtime availability still require separate validation.

### ADR: Visual foundation before market behavior

- **Status**: Implemented and accepted by the engineer on 2026-11-17.
- **Context**: Market-specific shopping needs clearer navigation and a denser
  list, but mixing a visual redesign with persistence changes increases review risk.
- **Decision**: Refresh the existing App, GroceryList, and SearchDialog first,
  preserving React/MUI/Firebase versions, callback ownership, the shared data
  model, and existing shopping flows. Use category sections, accessible purchase
  actions, a non-blocking empty/completed state, and a responsive fixed add action.
- **Consequences**: No new application components or dependencies. Existing
  records remain compatible. Markets and write acknowledgment/error handling
  must not be inferred from this visual milestone; implement them end-to-end
  only after the visual foundation is reviewed.

### ADR: One market per shared item with acknowledged membership

- **Status**: Implemented after visual acceptance on 2026-11-17.
- **Context**: Store-specific shopping needs safe destinations without splitting
  the shared list or treating Firebase local value events as server confirmation.
- **Decision**: Add optional `marketId`, a source-controlled market catalog,
  and local selected-button filters. Keep Firebase ownership in App and derive
  counts from its effective collection. Overlay only pending membership fields;
  release on acknowledgment and reconcile rejection against rollback. Preserve
  unknown IDs, saved re-add destinations, failed input, and keyboard focus.
- **Consequences**: No migration, new components, dependencies, services, or
  independent store lists. Buying stays global; category stays independent.
  No new offline persistence guarantees. Before release, the authorized Firebase
  owner must verify external rules accept optional supported market IDs and
  null clearing; local synthetic validation does not establish rule compatibility.

### C4 system context

The diagram keeps the system boundary at the shopping-list application and shows only its direct user and persistence system, following the [C4 system-context guidance](https://c4model.com/diagrams/system-context). The editable source is [`architecture.drawio`](./architecture.drawio).

![C4 system context diagram](./system-context.svg)

## External Context

### Firebase Realtime Database

- **Role**: Runtime persistence for grocery records under `/groceries`.
- **Source/configuration**: Firebase SDK dependency in `package.json`; client initialization in `src/shared/config.tsx` (values omitted).
- **Boundary**: The browser application reads and writes directly through the Firebase SDK; no application API sits between them.
- **Unresolved assumptions**: Authentication and database rules are not represented in this repository and must be checked in the Firebase project.

### Vercel

- **Role**: Git-driven preview and production hosting.
- **Source/configuration**: `vercel.json`, Node engine in `package.json`, and Vercel project `shopping-app-67k0` linked to `bernhardwhy/shopping-app`.
- **Boundary**: Builds and serves static frontend assets; it does not host or proxy the Firebase database.
- **Release**: Merge a verified feature preview into `master` to update the stable domain. See the [deployment guide](../README.md#deployment).

### CircleCI (legacy)

- **Role**: Continuous integration for dependency installation and test/coverage reporting.
- **Source/configuration**: `.circleci/config.yml`.
- **Boundary**: CircleCI checks out the repository and runs npm commands; no deployment or runtime traffic is configured.
- **Unresolved assumptions**: Whether this legacy integration remains enabled is not verified. Deployment is handled by Vercel.

### Public npm registry

- **Role**: Public application and build-tool dependency installation.
- **Source/configuration**: Root `.npmrc`.
- **Boundary**: npm resolves the committed lockfile against `https://registry.npmjs.org/`; cloud builds need no private feed credentials.
