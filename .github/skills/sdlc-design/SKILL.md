---
name: sdlc-design
description: Prepare architecture and implementation planning artifacts for a user story. Use this skill when the user needs design decisions, pattern analysis, or an implementation plan before coding.
---

# SDLC Design

## Use this skill when

- A story exists and implementation has not started yet
- The user asks for architecture guidance, design decisions, or an implementation plan
- The task needs pattern reuse and consistency with existing architecture

## Do not use this skill when

- The story is still unclear and needs initial clarification first (use `sdlc-specify`)
- The user asked to directly implement approved tasks (use `sdlc-implement`)

## Inputs

- `StoryMarkdownFilePath`
- `_wiki/architecture.md`

## Steps

1. Read `.github/agents/pattern-analyzer.agent.md` and follow its required structure.
2. Run `runSubagent` for the pattern-analyzer flow using:
	- the story file
	- `_wiki/architecture.md`
3. Extract and summarize:
	- reusable patterns, architectural constraints, and conventions to preserve
	- the component structure and test depth of analogous implementations,
	  including related configuration, documentation, and colocated artifacts
	- recorded engineer direction and any decision needed because comparable
	  implementations use mixed optional-artifact conventions
  - When the story is silent and comparable implementations use mixed optional
    artifacts, ask the requesting engineer which convention to follow before
    generating the implementation plan.
4. Read `.github/agents/implementation-plan.agent.md` and follow its required structure.
5. Run `runSubagent` for the implementation-plan flow using the same inputs.
6. Save the resulting implementation plan at `_wiki/plans/<plan-slug>.md` using a concise, deterministic filename.
7. Condense only redundant wording; do not remove required decisions, risks, or acceptance mapping.
8. Read `.github/skills/devils-advocate/SKILL.md` and run one spec-mode Devil's Advocate pass against the saved implementation plan.
9. Persist the returned objection record at `_wiki/Objections/<plan-slug>.md`.
	- Preserve the Devil's Advocate prose and its pending dispositions exactly when first writing the record.
	- Do not leave the record only in chat.
	- If the file already exists, read it before writing and preserve all earlier objections.
10. Present the plan and persisted objections for review with `❓STOP`.
11. When the user provides resolutions:
	- Update the plan to implement accepted decisions.
	- Update the matching objection dispositions and rationales while retaining every objection body.
	- Validate every changed Markdown file, including newly created untracked artifacts, with Markdown diagnostics.
	- Run `git diff --check` for tracked working-tree changes. It does not inspect untracked plans or objection records; check each such file separately with an equivalent whitespace check. On Windows, use `git diff --no-index --check -- NUL <path>` and inspect its output because exit code `1` only means the file differs from `NUL`.
12. Run a fresh spec-mode Devil's Advocate pass only when the plan is materially revised or the user explicitly requests another pass.
	- Consolidate the fresh findings into the existing record rather than replacing it.
	- Continue objection IDs from the highest existing ID, keep earlier prose and dispositions, and add a short consolidation note identifying the additional pass.
	- Validate the consolidated record and plan with Markdown diagnostics, then apply both tracked and untracked whitespace checks before returning to review.
13. Once the user approves the plan and objection dispositions, tell them to commit both the implementation plan and its matching objection record to Git before implementation begins.
	- Do not commit or push these design artifacts on the user's behalf unless explicitly asked.
	- Explain that both are temporary task artifacts and must be deleted after implementation is complete.

## Output

- A refined design summary
- A concrete implementation plan linked to the story
- A persisted spec-mode objection record at `_wiki/Objections/<plan-slug>.md`
- A consolidated objection history when a materially revised plan receives additional Devil's Advocate passes
- Explicit assumptions and open questions
- A handoff telling the user to commit the approved plan and matching objection record before implementation, and that both must be deleted after implementation is complete

## Handoff

- Request manual review with `❓STOP` after the initial objection record is persisted and after any consolidated follow-up pass
- Ask user to confirm: architecture fit, scope boundaries, task ordering, and the disposition of any major objections
- After approval, tell the user to commit the implementation plan and its matching objection record before implementation begins; state that both temporary artifacts must be deleted after implementation is complete
