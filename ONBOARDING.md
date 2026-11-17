<!-- Generated from HARNESS.md, AGENTS.md, and REFLECTION_LOG.md.
     Regenerate through the onboarding flow when those sources change. -->

# Welcome to continuos-deploy-basics

This React app helps shoppers manage a grocery list, with grocery data stored in Firebase Realtime Database. Expect a small client-side codebase with no project-owned backend; local data operations need access to the configured Firebase project.

---

## Tech Stack

- **TypeScript 4.9.5, JavaScript, and CSS** — application source.
- **React 16.8.6 and Create React App 5.0.1** — UI and development/build tooling.
- **Material-UI 4** — interface components.
- **Firebase SDK 8.10.1** — direct browser access to the Realtime Database, using the namespaced API.
- **Node.js 22.x** — local and Vercel build runtime.
- **npm** — dependencies and scripts in `package.json` and `package-lock.json`.
- **Jest through Create React App** — test runner.

---

## How We Write Code

- Name React components and component files in PascalCase, functions and values in camelCase, and CSS classes in kebab-case.
- Keep components under `src/`, shared modules under `src/shared/`, and component tests beside their components.
- Surface external-operation failures in the UI or propagate them to callers; do not silently ignore them.
- Keep README setup, build, and test instructions current. Comments explain non-obvious behavior.
- Follow `AGENTS.md` for broader implementation, review, security, and test-writing guidance.

---

## What's Enforced

### At commit time

- Formatting and secret detection are declared but unverified. No formatter or gitleaks installation was found, so neither has an automated check yet.

### At PR time

- Agent review is expected for naming, file structure, error handling, and documentation conventions. These reviews are not wired into an automated CI reviewer.
- Vercel runs the component tests before building each deployment. Failed tests or builds prevent publication; no coverage threshold is configured.

### On schedule

- Monthly agent reviews are declared for documentation freshness, dependency currency, convention drift, and dead code. Automatic fixes are enabled in `HARNESS.md`; no scheduler is configured in this repository.

---

## Common Pitfalls

- **Firebase is external**: There is no local database or backend service in the repository. The browser app needs network access to Firebase for grocery data.
- **Access rules are external**: The repository does not define Firebase authentication or database rules. Verify those in the Firebase project; do not copy configuration values into documentation.
- **Use the pinned runtime**: Install with `node scripts/run_installpackages.js` on Node 22. This uses `npm ci` and the public npm registry. The separate legacy CircleCI Node 8 configuration is not compatible with this toolchain.
- **The default test command watches**: Use `scripts/run_tests.js` for a non-interactive test run.

---

## Architecture Decisions

No explicit architecture decisions or ADRs are recorded in `AGENTS.md` or `REFLECTION_LOG.md`. [`_wiki/architecture.md`](_wiki/architecture.md) documents the current components, data flow, and external boundaries; treat it as a factual overview rather than a decision log.

---

## How We Test

Run `scripts/run_tests.js` to execute Jest through Create React App without watch mode. Pass an optional test file path to narrow the run. The existing tests are component-render smoke tests in `src/App.test.tsx` and `src/GroceryList/GroceryList.test.tsx`; there are no Firebase integration tests or coverage threshold.

Run `scripts/run_build.js` for the production build. Vercel runs both wrappers before deployment; see the [README deployment section](README.md#deployment) for the stable URL and feature-branch-to-master release process.

---

## How the Harness Works

- **Advisory loop** — no editing hooks are configured.
- **Strict loop** — Vercel runs the deterministic test and build checks. Agent-review constraints are expectations for review, not automated pipeline gates.
- **Investigative loop** — four monthly garbage-collection reviews are declared in `HARNESS.md`; no scheduled runner is configured.

Observability snapshots, reflection reviews, and onboarding refreshes have a monthly cadence.

---

## Your First PR Checklist

- [ ] Keep component/file, function/value, and CSS-class names consistent with the conventions.
- [ ] Keep components, shared modules, and tests in their expected locations.
- [ ] Surface failures from external operations.
- [ ] Update README setup/build/test instructions when they change.
- [ ] Check that no secrets are committed; secret scanning is not automated yet.
- [ ] Run `scripts/run_build.js` and `scripts/run_tests.js`.
- [ ] Review the changes for security and add focused tests for behavior changes.

---

## Where to Learn More

- [How_to_Agentic.md](How_to_Agentic.md) — working in an initialized Agentic Engineering project.
- [HARNESS.md](HARNESS.md) — project conventions, constraints, and review cadence.
- [AGENTS.md](AGENTS.md) — broader agent and contributor guidance.
- [REFLECTION_LOG.md](REFLECTION_LOG.md) — accumulated session learnings.
- [_wiki/architecture.md](_wiki/architecture.md) — architecture and system context.
- [`.github/copilot-instructions.md`](.github/copilot-instructions.md) — generated verification-script guidance.
