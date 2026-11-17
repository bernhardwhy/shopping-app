---
name: agentic-assess
description: Grounded assessment — place this repository on the Agentic Experience maturity model from its own habitat and give one next move, in-editor, in under ten minutes.
argument-hint: '[TargetFolder]'
---

# /agentic-assess

Run the Agentic Enablement Companion's **grounded assessment** for `[TargetFolder]`
(default: the current repository).

This is the companion's **Down** direction: read where the team actually is and
point it at its single next move. It works from the repo's own habitat and
broader signals: places the eight repo-observable dimensions
evidence-first, runs a short clarifying journey to place the six behavioural
dimensions, and reports the Sovereign Engineer cognitive read + Habitat Build
Gap. Live-session signal and per-runtime confidence are added by a later slice
and are out of scope here.

## How to run

The maturity model and scoring are **embedded** in the backing skill — read it
and follow its process exactly:

- `.github/skills/agentic-assess/SKILL.md`

It is self-contained: do not depend on any external plugin, repo, or service.

## What you produce

1. A short, in-editor **grounded assessment**: a Habitat Maturity placement and **one**
   single next move, grounded in cited evidence from `HARNESS.md` / `AGENTS.md`.
2. A persisted **placement touchstone** at `.agentic/assess/placement.json` (fixed
   schema — see the skill) that later companion capabilities reference.

Keep it under ten minutes. Be honest about confidence: in this slice the
behavioural dimensions are *inferred* and there is no live-session read — say so.
