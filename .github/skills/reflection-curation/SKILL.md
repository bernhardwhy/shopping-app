---
name: reflection-curation
description: Review `REFLECTION_LOG.md` interactively, one reflection at a time, and let the user implement the learning, create a follow-up Task, or delete the reflection. Use when the user asks to review, process, triage, or continue reflections.
---

# Reflection Curation

Process one reflection-log entry at a time without silently broadening scope or
processing the next entry before the user chooses an action.

## Use this skill when

- The user asks to review, triage, process, or continue `REFLECTION_LOG.md`.
- The user wants to decide whether a reflection becomes a control-surface
  improvement, a follow-up Task, or is deleted.

## Do not use this skill when

- The user already identified a specific implementation Task to deliver; use
  the appropriate implementation workflow.
- The user asks to create or edit a skill without reviewing a reflection; use
  `create-skill`.
- The user asks for a maturity assessment or enablement request; use the
  relevant Agentic Enablement Companion skill.

## Inputs

- `REFLECTION_LOG.md`.
- The user's chosen action for the currently rendered reflection.
- A steering comment in the form `4: <your steering comment>` when the user
  needs to correct earlier reflection handling.
- Repository context needed to identify the smallest control surface that owns
  an accepted learning.

## Deterministic helpers

The helper scripts are in the `scripts/` directory beside this `SKILL.md`.
Resolve them relative to this skill file, rather than assuming a GitHub or
Claude installation path. They always use the repository-root
`./REFLECTION_LOG.md` path. They are vendored product tooling — do not
hand-edit them; report problems upstream instead.

`read-first.js` writes exactly the first top-level reflection block, including
its opening separator. `delete-first.js` removes that same block while
preserving the log header and the next entry's separator, then writes
`Reflection deleted successfully.`.

## Steps

1. Run `read-first.js` to read the current first reflection block from
  `./REFLECTION_LOG.md`, from its opening `---` separator through the line
  before the next separator.
2. Render the complete block exactly as Markdown, then ask the user to choose:
   1. Implement the learning in the `HARNESS.md` or its owning control surface.
   2. Create a follow-up Task to fix the issue.
   3. Discard the reflection.
   4. Adjust previous reflection handling.
3. When the user chooses implementation:
   - Identify the smallest owning control surface before editing. A reflection
     from a faulty workflow specification normally belongs in that workflow or
     its instructions, not automatically in `HARNESS.md`.
   - Use `HARNESS.md` for team conventions, their enforcement mechanisms,
     recurring garbage-collection checks, and operational health signals.
     When a reflection changes the harness, do not manually synchronize
     `.github/copilot-instructions.md` or another harness-managed downstream
     surface; `/harness-sync` owns that synchronization after triage.
   - Do not use `HARNESS.md` or its downstream surfaces as a log for one-off
     workflow learnings.
   - Make and validate the focused change.
   - Delete the reflection only after validation succeeds.
4. When the user chooses a follow-up Task:
   - Recommend this option when a concrete control surface needs a separately
     planned code or content change.
   - For an issue originating from an AE-repository skill, use `agentic-support`.
     Preserve its draft-and-explicit-confirmation boundary before filing.
   - Delete the reflection only after the Task exists.
5. When the user chooses discard the reflection:
   - Run `delete-first.js` to remove only the selected reflection block from `./REFLECTION_LOG.md`.
6. When the user provides an adjustment comment:
   - Apply it only to the earlier reflection handling it identifies.
   - Make and validate any focused correction it requires.
   - Do not delete or advance the currently rendered reflection because of the
     adjustment comment. Re-render it and ask for its action after the correction.
7. After completing the selected action, run `read-first.js` and render the
  next remaining reflection, then ask for the next choice. Do not process it
  automatically.
8. When no reflections remain, tell the user to run `/harness-sync` once to
  scan and reconcile harness-managed control surfaces.

## Output

- The complete rendered current reflection.
- A user-selected implementation, follow-up Task, or deletion result.
- The outcome of a steering correction, followed by the still-current reflection.
- The next reflection for review after completion of the selected action.
- After the final reflection, a handoff to `/harness-sync`.

## Validation

- Verify the rendered reflection exactly matches the current selected block.
- Verify an implemented learning is placed in its owning control surface and
  passes a focused validation.
- Verify a Task exists before deleting a reflection routed to Task creation.
- Verify deletion removes only the selected block.
- Verify steering changes only the identified prior handling and leaves the
  current reflection selected.
- Verify the next displayed reflection is the next remaining block.
- After the final reflection, do not manually synchronize harness-managed
  surfaces; hand off to `/harness-sync`.

## Handoff

- State the completed action and its focused validation result.
- Display the next reflection and stop for the user's choice.
- When the log is empty, tell the user to run `/harness-sync` once.