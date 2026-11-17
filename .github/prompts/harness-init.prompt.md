---
name: harness-init
description: Set up a living harness for this project — select features, discover the stack, define conventions, and generate HARNESS.md with enforcement. Re-run to add features incrementally.
---

# /harness-init

Set up a living harness for this project. Choose which features to
configure — context engineering, constraints, garbage collection, CI,
and observability — then walk through a guided conversation for each.
Re-run at any time to add features incrementally; existing
configuration is preserved.

Keep this setup self-contained in this repo. Do not dispatch helper
prompts, agents, or skills that are not present here.

## Process

### 1. Discover

Perform a read-only discovery scan before asking the user questions.
Build a factual baseline only.

Scan these surfaces:

- **Stack detection**: `go.mod`, `package.json`, `pom.xml`,
  `requirements.txt`, `pyproject.toml`, `Cargo.toml`, `*.csproj`,
  `Dockerfile`, `docker-compose*`
- **Linter and formatter detection**: `.eslintrc*`, `eslint.config.*`,
  `.prettierrc*`, `biome.json*`, `.golangci.yml`, `ruff.toml`,
  `setup.cfg`, `.editorconfig`, language-specific formatter configs,
  and manifest dependencies
- **CI detection**: `.github/workflows/*.yml`, `.gitlab-ci.yml`,
  `Jenkinsfile`, `.circleci/config.yml`
- **Test framework detection**: test directories, coverage configs,
  test runner scripts, and manifest scripts
- **Convention documentation**: `HARNESS.md`,
  `.github/copilot-instructions.md`, `CONTRIBUTING.md`, `.editorconfig`,
  relevant `docs/` content
- **Pre-commit hooks**: `.husky/`, `.pre-commit-config.yaml`, `.git/hooks/`

Return the results in this structure and use it for the rest of the
conversation:

```text
## Discovery Report

### Stack
- Languages: [list with versions]
- Build system: [name and version]
- Frameworks: [list]

### Existing Enforcement
- Linters: [list with config paths]
- Formatters: [list with config paths]
- Type checkers: [list]
- Secret scanners: [list]

### CI/CD
- Platform: [GitHub Actions / other / none]
- Existing checks: [list]

### Test Framework
- Runner: [name and command]
- Coverage: [tool and threshold if configured]

### Convention Documentation
- Files found: [list with brief summary]
- Notable conventions: [key rules already documented]

### Pre-commit Hooks
- Tool: [husky / pre-commit / manual hooks / none]
- Existing hooks: [list]
```

Also check whether `HARNESS.md` already exists. If it does, note which
sections contain real content rather than the placeholder marker:

```text
<!-- Not yet configured. Run /harness-init and select this feature to set up. -->
```

Pass this information to feature selection so re-runs default to adding
only the still-unconfigured features.

### 2. Present Findings

Show the user what was discovered:

- Tech stack and versions
- Existing linters, formatters, tests, and CI checks
- Existing convention documentation
- Pre-commit hooks already in place

Frame this as: "Here's what your project already has. Let's build on
it."

### 3. Select Features

Present a feature selection menu. The five selectable areas are:

| Feature | What it configures | Default (first run) |
| --- | --- | --- |
| Context engineering | Stack declaration + conventions | on |
| Architectural constraints | Enforcement rules + secret detection | on |
| Garbage collection | Periodic entropy checks | on |
| CI configuration | CI follow-up recommendation only | on |
| Observability | README badge + status section | on |

**First run** (no HARNESS.md exists): all features default to on.

**Re-run** (HARNESS.md exists): detect which sections are already
configured by checking for the placeholder marker in each section.
Already-configured sections default to off. Unconfigured sections
default to on. The user can toggle any combination.

Tell the user: "All features are selected by default. Deselect any you
want to skip for now - you can always add them later by re-running
/harness-init."

On re-run, explicitly tell the user which features are already
configured and frame still-empty features as recommendations: "These
features are not set up yet. I recommend adding them."

### 4. Ask About Conventions

**Gate**: only run this step if "Context engineering" was selected.

Ask about conventions one topic at a time. Use the discovery report to
offer concrete suggestions.

Cover:

- **Naming**: casing, length, domain vocabulary
- **File structure**: file organisation, package boundaries, test placement
- **Error handling**: propagation, wrapping, recovery, logging
- **Documentation**: what needs doc comments and what comments should explain

Convention writing rules:

- Write **observable** rules, not aspirations
- Use the two-reviewer test: two reviewers should agree on violations
  without discussion
- Describe outcomes, not tool configs or vague intent
- Avoid phrases like "write clean code" or "use best practices"

Examples:

| Weak rule | Better rule |
| --- | --- |
| "Write clean code" | Rewrite into specific observable rules |
| "Keep functions short" | "Functions must not exceed 40 lines" |
| "Use meaningful names" | "Variables must be 3+ characters except `i`, `j`, `k`, `err`" |
| "Handle errors properly" | "Every returned error must be wrapped with context" |

### 5. Ask About Constraints

**Gate**: only run this step if "Architectural constraints" was selected.

For each convention, ask whether it should be enforced. For each rule
that should be enforced:

- Check whether a deterministic tool was discovered that can enforce it
- If yes, offer `deterministic`
- If no, offer `agent` or `unverified`

Ask about scope: `commit`, `pr`, or periodic sweep.

#### Secret detection

The template includes a "No secrets in source" constraint. During setup:

1. Check whether `gitleaks` is available.
2. If found: tell the user the constraint can be `deterministic` with
   `gitleaks detect --source . --no-banner` and offer an initial scan.
3. If not found: tell the user the constraint will stay `unverified`
   unless they install `gitleaks` and re-run `/harness-init`.

If the user asks for more detail, explain the scan command, allowlist
idea, and re-run flow inline. Tell the user what happened either way and
allow them to override the default constraint choice.

### 6. Ask About Garbage Collection

**Gate**: only run this step if "Garbage collection" was selected.

Ask whether the user wants periodic checks for:

- Documentation freshness
- Dependency currency
- Convention drift
- Dead code

For each, set frequency and auto-fix preference.

### 7. Generate HARNESS.md

Use `.github/harness/templates/HARNESS.md` as the source template.

**First run** (no HARNESS.md exists):

- Replace placeholder values with discovered facts and user responses
- For each unselected feature, replace the section body with the
  placeholder marker
- Write the result to `HARNESS.md` at the project root

**Re-run** (HARNESS.md exists):

- Read the existing `HARNESS.md`
- For each selected feature, replace the corresponding section
  (`## Context`, `## Constraints`, `## Garbage Collection`,
  `## Observability`, `## Status`) with fresh content
- Preserve unselected sections verbatim

After writing `HARNESS.md`, ensure it contains a template version marker
immediately after the intro comment block:

```text
<!-- template-version: X.Y.Z -->
```

Read `X.Y.Z` from `.github/harness/plugin.json`. If the marker exists,
update it. If it does not exist, insert it after the Fowler article
comment line.

### 8. Validate Generated HARNESS.md

After writing `HARNESS.md`, read it back and verify:

1. All top-level sections exist: `## Context`, `## Constraints`,
   `## Garbage Collection`, `## Observability`, `## Status`
2. Context contains `### Stack` and `### Conventions`
3. Observability contains `### Operating cadence`,
   `### Health thresholds`, and `### Regression detection`
4. Status contains `Last audit`, `Constraints enforced`,
   `Garbage collection active`, and `Drift detected`
5. The template version marker matches `.github/harness/plugin.json`

If any check fails, fix `HARNESS.md` in place. Do not restart the
conversation.

### 8.1 Remove Template Copy

After `HARNESS.md` has been written and validated successfully, delete
`.github/harness/templates/HARNESS.md` from the target project.

- Delete only the copied template file inside the target project.
- Do not delete the source template from this repository.
- If the file is already missing, continue without error.

### 9. Generate CI Configuration

**Gate**: only run this step if "CI configuration" was selected.

CI configuration requires constraints to exist. If "Architectural
constraints" was not selected and no real constraints exist yet, tell
the user: "CI configuration requires at least one constraint to
enforce. Skipping CI setup - run /harness-init again after adding
constraints." Then skip CI setup.

This repo ships one Azure DevOps CI template:

- `.github/harness/templates/ci-azure-pipelines.yml`

If constraints exist and Azure DevOps was detected, or the user wants to
add Azure Pipelines validation now:

- Read the template
- Add deterministic tool steps for each PR-scoped deterministic constraint
- Write `azure-pipelines.harness.yml`

If an existing `azure-pipelines.yml` already handles PR validation, do
not overwrite it. Instead:

- tell the user what deterministic checks should be ported into the existing pipeline
- or generate `azure-pipelines.harness.yml` as a non-destructive companion file

If no Azure DevOps CI platform was detected, skip CI setup cleanly.

If any agent-scoped PR constraints exist, tell the user the generated
pipeline only wires deterministic PR checks. Do not invent hosted review
automation from this repo.

### 10. Add README Badge

**Gate**: only run this step if "Observability" was selected.

The badge requires `HARNESS.md` to contain at least one configured
section. If it contains only placeholder markers, tell the user: "No
harness features configured yet - skipping badge. Run /harness-init to
add features first." Then skip the badge step.

If `HARNESS.md` has real content, add or update the harness badge in
`README.md` using `.github/harness/scripts/update-badge.js` (vendored
product tooling — do not hand-edit; report issues upstream).

### 11. Summary

Tell the user:

- Which features were configured in this run
- How many constraints were declared and how many are enforced
- Which features remain unconfigured, framed as follow-up options
- Next step: re-run `/harness-sync` to detect drift and keep generated
  files aligned with `HARNESS.md`
