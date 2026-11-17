---
name: onboarding
description: Generate or refresh ONBOARDING.md for an already-onboarded project using HARNESS.md, AGENTS.md, REFLECTION_LOG.md, and the local ONBOARDING template.
---

# /onboarding

Generate or refresh `ONBOARDING.md` in the current project.

## Inputs

Read these sources when present:

- `HARNESS.md`
- `AGENTS.md`
- `REFLECTION_LOG.md`
- `_wiki/architecture.md`
- `.github/harness/templates/ONBOARDING.md`

If `HARNESS.md` is missing, stop and tell the user to complete
`/harness-init` first.

If `.github/harness/templates/ONBOARDING.md` is missing, stop and tell the
user to update the project first so the latest template is available.

If `AGENTS.md` or `REFLECTION_LOG.md` is missing, continue with reduced
sources and skip sections that depend on them.

## Output

Write `ONBOARDING.md` in the project root as a friendly onboarding guide
for new team members.

Use `.github/harness/templates/ONBOARDING.md` as the structure.

Fill these sections in order:

1. Welcome
2. Tech Stack
3. How We Write Code
4. What's Enforced
5. Common Pitfalls
6. Architecture Decisions
7. How We Test
8. How the Harness Works
9. Your First PR Checklist
10. Where to Learn More

Use `_wiki/architecture.md` when present to strengthen:

- `Welcome`
- `Tech Stack`
- `Architecture Decisions`
- `Where to Learn More`

In `What's Enforced`, group constraints by scope:

- At commit time
- At PR time
- On schedule

In `Common Pitfalls`, synthesize practical warnings from `AGENTS.md`
gotchas and recent reflection entries. Focus on what happened and how to
avoid it.

In `How the Harness Works`, explain the three loops simply:

- Advisory loop
- Strict loop
- Investigative loop

## Validation

After writing `ONBOARDING.md`, validate that:

- all 10 section headings exist
- the generated header comment is present
- no `{{` or `}}` placeholders remain
- `What's Enforced` has at least one of these subsections when relevant:
  `At commit time`, `At PR time`, `On schedule`

If validation fails, fix the file in place. Do not regenerate from
scratch.

Check whether `README.md` links to `ONBOARDING.md`. If not, add this line
near project-introduction or getting-started content:

- `New to the project? Start with [ONBOARDING.md](ONBOARDING.md).`

After `ONBOARDING.md` is valid, delete
`.github/harness/templates/ONBOARDING.md` from the target project.
