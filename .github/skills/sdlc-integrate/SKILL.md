---
name: sdlc-integrate
description: Integrate implemented changes into delivery workflows through CI/CD checks, test planning, and security-oriented validation. Use this skill after implementation units are completed and ready for integration hardening.
---

# SDLC Integrate

## Use this skill when

- Implementation is complete or near-complete and needs integration validation
- The user asks for CI/CD alignment, release-readiness checks, test planning, or security validation

## Do not use this skill when

- Core coding tasks are still unfinished (use `sdlc-implement`)
- The story definition is still changing (use `sdlc-specify` or `sdlc-design`)
- The user asks to review a pull request (use `sdlc-implement-ado-pr-review`)

## Inputs

- The implemented work item, story, or approved plan
- Changed files and relevant test, build, package, and pipeline assets
- Repository instructions and delivery constraints

## Steps

1. Establish the integration surface.
  - Read the repository's `AGENTS.md`, `HARNESS.md`, and relevant pipeline configuration.
  - Inspect the full changed-file set and map each behavior-bearing change to a focused validation.
  - Identify release, package, migration, deployment, and security effects before selecting checks.
2. Validate the implementation locally.
  - Run the narrowest affected tests first, followed by the repository's required build and test commands.
  - Run `git diff --check` for tracked changes.
  - For changed distributable packages, inspect the package manifest with `npm pack --dry-run` or the equivalent and verify required content is included.
  - For changed initialization, update, or migration flows, exercise a repeat run and preservation of valid user-owned configuration.
3. Check delivery automation.
  - Read `.github/agents/pipeline.agent.md` and use the `pipeline` agent when pipeline or release configuration changes, or when a concrete CI validation gap needs investigation.
  - Compare the required local checks with the configured CI gates; do not claim that a convention is enforced unless the pipeline implements it.
  - Verify that pipeline, dependency, and release changes preserve existing branch and publishing constraints.
  - Propose pipeline changes only when the implementation creates a concrete validation gap.
4. Assess security proportionately.
  - Read `.github/agents/security-analysis.agent.md` and use the `security-analysis` agent for changes that affect trust boundaries, secrets, data handling, deployment, dependencies, or exposed interfaces.
  - Check secrets handling, authentication and authorization boundaries, input validation, dependency changes, and generated artifacts relevant to the change.
  - Add focused automated coverage where a behavior can be reproduced; otherwise document an executable manual validation case.
5. Record only durable integration guidance.
  - Summarize validation evidence, remaining risks, and manual follow-up steps in the work item or pull request.
  - Create a repository document only when it explains an enduring approach; keep plans, checklists, and temporary test artifacts out of the completed change.

## Output

- Executed validation results and evidence
- CI/CD or release-readiness findings grounded in the configured pipeline
- Focused automated-test gaps and executable manual cases where needed
- Security validation findings proportional to the changed risk surface

## Handoff

- Report remaining risks and any required manual validation before integration
- Keep pull request completion and deployment actions with the requesting engineer