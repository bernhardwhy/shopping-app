# Architecture

## High-Level Overview

- **Purpose**: A browser-based grocery list for viewing, searching, adding, categorizing, and marking grocery items as bought.
- **Languages**: TypeScript (3.5.3), JavaScript, and CSS.
- **Frameworks and libraries**: React 16.8.6, Create React App / `react-scripts` 3.0.1, Material-UI 4, and Firebase SDK 6.3.3.
- **Package manager**: npm; dependencies and scripts are declared in `package.json` and `package-lock.json`.
- **Persistence**: Firebase Realtime Database, accessed through the Firebase client SDK. There is no project-owned backend or local database service.
- **Local development**: Install npm dependencies and run `npm start`. The app needs network access and a reachable Firebase database for grocery data.

## Architecture

### Style and building blocks

The application is a single-page React client. `src/index.tsx` mounts `App` and registers the service worker. `App` owns grocery-list state and Firebase reads and writes. `GroceryList` renders and edits items; `SearchDialog` filters existing items and adds new ones. `GroceryType` describes grocery records.

Components communicate through props and callbacks. Firebase access is concentrated in `App` and initialized in `src/shared/config.tsx`; there is no separate repository or service layer.

### Runtime and data flow

On mount, `App` subscribes to the Firebase `/groceries` value. It maps the returned records into grocery items and displays those not yet bought. Changes to purchase state, name, or area, and new-item creation are written through the Firebase SDK. The value subscription supplies updated records to the UI. Search filters the current in-memory list and calls back into `App` for actions.

### Security and configuration

Firebase client configuration is located in `src/shared/config.tsx`; configuration values are intentionally omitted here. The browser communicates directly with Firebase. No application authentication flow or database security rules are defined in this repository, so access control and rule enforcement must be verified in the Firebase project configuration.

### Testing and delivery

Tests use Jest through Create React App (`npm test`). Existing tests are component-render smoke tests in `src/App.test.tsx` and `src/GroceryList/GroceryList.test.tsx`; no Firebase integration tests or coverage threshold are configured.

CircleCI configuration in `.circleci/config.yml` uses Node 8, installs npm dependencies, runs `npm test -- --coverage`, and uploads coverage through the Code Climate test reporter. No deployment job is defined there.

### C4 system context

The diagram keeps the system boundary at the shopping-list application and shows only its direct user and persistence system, following the [C4 system-context guidance](https://c4model.com/diagrams/system-context). The editable source is [`architecture.drawio`](./architecture.drawio).

![C4 system context diagram](./system-context.svg)

## External Context

### Firebase Realtime Database

- **Role**: Runtime persistence for grocery records under `/groceries`.
- **Source/configuration**: Firebase SDK dependency in `package.json`; client initialization in `src/shared/config.tsx` (values omitted).
- **Boundary**: The browser application reads and writes directly through the Firebase SDK; no application API sits between them.
- **Unresolved assumptions**: Authentication and database rules are not represented in this repository and must be checked in the Firebase project.

### CircleCI

- **Role**: Continuous integration for dependency installation and test/coverage reporting.
- **Source/configuration**: `.circleci/config.yml`.
- **Boundary**: CircleCI checks out the repository and runs npm commands; no deployment or runtime traffic is configured.
- **Unresolved assumptions**: Deployment is managed outside the checked-in pipeline, if applicable.

### Azure Artifacts npm feed

- **Role**: Developer tooling feed for `@techtalk/agentic-engineering`; it is not an application runtime dependency.
- **Source/configuration**: Root `.npmrc`.
- **Boundary**: npm uses the feed during package resolution. The feed did not provide a transitive public dependency during CLI installation, so that one-off CLI install used the Azure feed for `@techtalk` and npmjs.org for public dependencies.
- **Unresolved assumptions**: Public-package upstream availability in the feed is not established.
