# How To Agentic

Short guide for working in an already-initialized Agentic Engineering project.

## Table Of Contents

[Control Files](#control-files) | [Prompt, Skill, Or Agent?](#prompt-skill-or-agent) | [Prompts](#prompts) | [Skills](#skills) | [Agents](#agents) | [Typical Flow](#typical-flow) | [Update Rules](#update-rules)

## Control Files

### HARNESS.md

The local operating contract: project context, conventions, constraints, garbage collection, and observability. Use it to understand how the project works, what is enforced, and when local rules should change.

### AGENTS.md

The shared company-wide and product-level agent contract.

- Read it before unfamiliar work.
- Treat it as read-only in normal project work.
- Do not edit it directly; broader rule gaps should go through human review.

### copilot-instructions.md

Project and team-specific instructions that Copilot follows when working in the repository.

### mcp-instructions.md

Separate additional instructions that agents follow when using installed MCPs.

### mcp.json

The configuration file for installed MCPs. Maintain it when adding, removing, or changing an MCP integration.

### REFLECTION_LOG.md

The raw learning log for surprises, workflow friction, and lessons from completed work.

- Use `/reflect` after meaningful work with the agent.
- Record proposals here first.
- Humans decide what later belongs in `HARNESS.md` or needs broader human review.

### architecture.md

The project architecture reference. It describes the system structure and intended direction for structural changes.

### ONBOARDING.md

The short newcomer guide for the target project. Use it when joining a repo or when refreshing guidance for the next contributor.

### Run Scripts

Generated PowerShell scripts for routine project work. Agents can reliably reuse them to install packages, lint code, test, build, and run the project.

## Prompt, Skill, Or Agent?

- Prompt: a named repeatable workflow.
- Skill: domain-specific guidance for a class of work.
- Agent: a specialized worker for a larger focused task.

## Prompts

- `onboarding.prompt.md`: generate or refresh `ONBOARDING.md` after npm `init` has initialized the project.
- `harness-init.prompt.md`: create or extend `HARNESS.md`.
- `harness-sync.prompt.md`: detect and fix drift in harness-managed surfaces. It does not rewrite `AGENTS.md`, `REFLECTION_LOG.md`, or the body of `HARNESS.md`.
- `reflect.prompt.md`: append a structured reflection after meaningful work.
- `agentic-assess.prompt.md`: place a repo on the maturity model and give one next move.

## Skills

### Governance And Enablement

- `agentic-recap`: summarize what landed while someone was away.
- `agentic-assess`: assess maturity and suggest one next move.
- `agentic-check-in`: offer a timely re-assess or re-steer nudge.
- `agentic-support`: draft an enablement request or upward contribution.
- `create-skill`: create or refactor a skill in this repo.
- `reflection-curation`: review reflections one at a time and route each to implementation, a follow-up Task, or deletion.

### Product And Delivery Shaping

- `sdlc-specify`: clarify a user story.
- `sdlc-design`: prepare design and implementation planning artifacts.
- `sdlc-integrate`: harden completed work with CI and validation.
- `ado-item-enrichment`: enrich an ADO item from source material.
- `devils-advocate`: challenge a spec or implementation.

### Delivery Mode

- `rapid-prototyping`: run a prototype-first workflow.

## Agents

### Planning And Analysis

- `analyse-us`, `challenge-us`, `challenge-pre-refinement`: shape or challenge story work.
- `implementation-plan`: generate a test-first implementation plan.
- `pattern-analyzer`: find existing code patterns before implementation.

### Setup And Documentation

- `harness-init`: create or update `HARNESS.md` in a target repo.
- `architecture`: generate `_wiki/architecture.md`.
- `readme`: refresh `README.md`.
- `create-run-scripts`: create build, start, and test scripts.

### Hardening

- `clean-up`: refactor for clarity without behavior change.
- `pipeline`: work on CI/CD setup.
- `security-analysis`: review security and zero-trust posture.

## Typical Workflow

1. Agents read `HARNESS.md`, `AGENTS.md`, and `copilot-instructions.md` before working in the project. They read `mcp-instructions.md` before using installed MCPs.
2. Read `ONBOARDING.md` and `architecture.md` for the project and system views.
3. If requirements are weak, use `sdlc-specify`, `analyse-us`, or `challenge-us`.
4. If implementation direction is unclear, use `sdlc-design`, `pattern-analyzer`, or `implementation-plan`.
5. Implement using local constraints and conventions. Agents use the run scripts for package installation, linting, testing, building, and running the project.
6. If local rules changed, update `HARNESS.md`. If you found a broader rule gap, write it to `REFLECTION_LOG.md` instead of editing `AGENTS.md`.
7. Run `/reflect` when the task produced a useful lesson.
8. Refresh `ONBOARDING.md` when harness, architecture, or newcomer guidance changed.

## Update Rules

- Update `HARNESS.md` for local conventions, checks, cadence, or enforcement changes.
- Do not update `AGENTS.md` in normal project work.
- Update `copilot-instructions.md` for project or team-specific instructions.
- Update `architecture.md` when the system structure changes.
- Update `mcp-instructions.md` when MCP guidance changes, and `mcp.json` when MCP configuration changes.
- Update `REFLECTION_LOG.md` for fresh lessons that are not yet durable guidance.
- Regenerate `ONBOARDING.md` when harness, architecture, or newcomer guidance changed.