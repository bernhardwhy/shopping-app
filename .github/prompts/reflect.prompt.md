---
name: reflect
description: Capture a post-task reflection and append it to REFLECTION_LOG.md.
---

# Reflect On Completed Work

Use this prompt after finishing a task. Create and append one structured
reflection entry to `REFLECTION_LOG.md`.

## Steps

1. Collect reflection input from the user, or infer it from the current
   session when the context is clear:
   - What was just worked on
   - What was surprising or unexpected
   - What future agents should know about this area
   - What would improve the workflow next time

2. Format one reflection entry exactly with this structure:

```text
---

- **Date**: [YYYY-MM-DD]
- **Agent**: [agent or workflow that did the work]
- **Task**: [what was done]
- **Surprise**: [unexpected result or insight]
- **Proposal**: [local guidance, prompt, or workflow improvement candidate, or "none"]
- **Improvement**: [what would improve the process]
- **Signal**: [context | instruction | workflow | failure | none]
- **Constraint**: [proposed constraint, or "none"]
```

3. Classify `Signal` from `Surprise` and `Improvement`:
   - `context`: missing or outdated project context
   - `instruction`: prompt, command, or shared guidance issue
   - `workflow`: process pattern that helped or hurt
   - `failure`: preventable error, missing check, or bad tool config
   - `none`: routine work with no clear routing signal

4. If the reflection describes a preventable failure, propose a
   candidate constraint in the entry. Do not modify `HARNESS.md`
   automatically. Record it in `Constraint` for later human review.

5. Append the entry to `REFLECTION_LOG.md` after the last entry,
   preserving separators.

6. Validate the last entry in `REFLECTION_LOG.md`:
   - Starts with `---`
   - Contains all mandatory fields: `Date`, `Agent`, `Task`, `Surprise`,
     `Proposal`, `Improvement`, `Signal`, `Constraint`
   - `Signal` value is one of: `context`, `instruction`, `workflow`,
     `failure`, `none`

   If validation fails, fix it in place using `unknown` defaults where
   needed. Do not ask the user to re-enter the whole reflection.

7. Do not modify `copilot-instructions.md` directly. Reflections propose learnings;
   humans curate the durable guidance. Do not treat `AGENTS.md` as a direct
   edit target from this workflow either.
