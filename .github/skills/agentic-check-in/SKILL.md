---
name: agentic-check-in
description: Run the Agentic Enablement Companion's Check-in direction — decide whether to offer the engineer a timely next move (re-assess or a Support draft) based on placement-touchstone staleness, either bound to live runtime events (Copilot CLI / VS Code) or at an explicit checkpoint, governed by rate-limiting and dedupe so good guidance arrives without nagging. Confidence is declared per runtime and degrades cleanly to the on-demand checkpoint where no event surface exists. Use when the user asks "should I re-assess?", "anything I should do now?", "is my placement stale?", at an end-of-invocation checkpoint, or in the flow of work. A nudge only ever OFFERS Assess or Support — it never files or transmits anything itself.
---

# Agentic Check-in — timing decision

The **Check-in** direction of the Agentic Enablement Companion: surface the right
next move *at the right moment* without nagging. The companion proactively
suggests a re-assessment or Support draft when it is warranted — and stays
silent when it is not — so good guidance arrives without anyone remembering to ask.

The timing decision runs in two trigger modes that share one decision logic:

- **On-demand checkpoint** — the simplest viable form: a
  deterministic decision at an explicit cheap checkpoint (e.g. the end of an
  invocation). This proved fatigue-control before any always-on surface existed.
- **Runtime-event bound** — the same decision attached to live
  runtime events inside Copilot CLI / VS Code, so the nudge arrives in the flow of
  work without anyone remembering to ask. Confidence is **declared per runtime**
  and the binding **degrades cleanly** to the on-demand checkpoint where a runtime
  exposes no usable event surface.

## What a nudge may do (the membrane)

A nudge **only ever offers** a flow that already exists:

- a re-assessment via [`agentic-assess`](../agentic-assess/SKILL.md), or
- a Support draft via [`agentic-support`](../agentic-support/SKILL.md).

The nudge itself **files and transmits nothing** — it does not create a work item,
confirm a draft, or send anything. It surfaces an offer; the human takes it (and
the existing flows keep their own confirm/identity membranes).

## Fatigue control (deterministic) — rate-limit + dedupe

The whole point of shipping the timing layer first is to prove **fatigue
control** before there is any always-on surface. Two deterministic controls:

- **Rate-limit window** — `rateLimitWindowDays` (default **7**). The same nudge is
  not shown twice inside this window.
- **Dedupe key** — what makes two nudges "the same". The key is
  `"<kind>:<anchorDimension>:<suggestedAction>"` (e.g.
  `re-steer:Testing:add-coverage-gate`). Two nudges with the same key inside the
  window are duplicates and the later one is suppressed.

Nudge history persists at `.agentic/check-in/nudges.json`:

```json
{
  "schemaVersion": "1",
  "rateLimitWindowDays": 7,
  "staleThresholdDays": 14,
  "nudges": [
    {
      "key": "re-steer:Testing:add-coverage-gate",
      "kind": "re-steer",
      "shownAt": "<ISO-8601>",
      "trigger": "runtime-event | on-demand-checkpoint",
      "runtime": "claude-code | copilot-cli | vscode | unknown",
      "eventConfidence": "high | partial | none"
    }
  ]
}
```

`trigger`, `runtime`, and `eventConfidence` are written by the runtime-binding
layer (slice 8). On-demand checkpoints record `trigger: "on-demand-checkpoint"`,
`runtime: "unknown"`, `eventConfidence: "none"`.

## Process

### 1. Read the touchstone and history (deterministic)

- Read `.agentic/assess/placement.json`. If it is missing, there is nothing to be
  ambient about — suggest running `/agentic-assess` once and stop.
- Read `.agentic/check-in/nudges.json` (treat absent as an empty history).

### 2. Decide whether a nudge is warranted

- **Staleness check (deterministic trigger):** compute the touchstone age from
  `generatedAt`. If age < `staleThresholdDays`, the placement is fresh — **no
  nudge**. If age ≥ threshold, a re-assess/re-steer is a *candidate*.
- **Warrant judgement (agentic):** decide whether the current context actually
  warrants a suggestion — is there a meaningfully better next move now (e.g. the
  touchstone flagged Testing as ready to move)? This is the one agentic call; it
  only ever *promotes* a deterministic candidate into an offer, never invents one.

### 3. Apply rate-limit + dedupe (deterministic)

- Build the dedupe `key` for the candidate nudge.
- If an entry with that `key` exists in `nudges.json` with `shownAt` inside
  `rateLimitWindowDays`, **suppress** — surface nothing, append nothing.
- Otherwise proceed.

### 4. Surface one offer and record it (deterministic)

- Surface **exactly one** suggestion, phrased as an offer of an existing flow
  ("your placement is N weeks old and Testing looked ready to move — want a
  re-steer?").
- Append a nudge entry (`key`, `kind`, `shownAt`) to `.agentic/check-in/nudges.json`
  (create `.agentic/check-in/` if needed). The record is what makes the next
  invocation dedupe correctly.

## Binding to runtime events

Slice 8 attaches the decision above to **actual runtime events** so the nudge
arrives in the flow of work. This is integration, not new judgement — the warrant
call, rate-limit, and dedupe are inherited unchanged.

### Detect the runtime and declare confidence

Detect the runtime hosting the session, subscribe to whatever event surface it
exposes, and **declare confidence** rather than over-claiming (mapping consistent
with `agentic-assess` slice 4):

| Runtime | Event-surface confidence |
|---|---|
| Claude Code | **high** |
| GitHub Copilot CLI | **partial** |
| VS Code runtime | **partial** |
| unknown / no event surface | **none → on-demand fallback** |

### Run the decision against events, fall back cleanly

- Where a usable event surface exists, run the (already rate-limited, deduped)
  decision against incoming events; record the surfaced nudge with
  `trigger: "runtime-event"`, the detected `runtime`, and its `eventConfidence`.
- Where **no** usable event surface exists, **fall back to the on-demand
  checkpoint and say so** — record `trigger: "on-demand-checkpoint"`,
  `runtime: "unknown"`, `eventConfidence: "none"`. **Never claim an event binding
  that did not happen.** Habitat/checkpoint behaviour dominates when event
  visibility is low.

Runtime parity is fragile — event visibility differs across runtimes — so this is
shipped late and always degrades to the proven slice-7 checkpoint rather than
over-claiming.

## Membrane & determinacy

- **Membrane**: a nudge offers; it never files or transmits. The Down/Up flows it
  offers keep their own confirm + identity membranes. Unchanged by event binding.
- **Determinacy line**:
  - **Deterministic** — the rate-limit window; the dedupe key and the "same nudge"
    test; the touchstone-staleness check; the suppression decision; persistence of
    nudge history; **runtime/event-surface detection, binding to available events,
    the per-runtime confidence label, and graceful fallback to the on-demand
    checkpoint**.
  - **Agentic** — judging whether the current context warrants a suggestion at all
    (is there a meaningfully better next move now?). Slice 8 adds no new agentic
    judgement beyond this.

## Scope

In scope: the **on-demand** checkpoint decision with rate-limit and dedupe
(slice 7) and **binding that decision to live runtime events** with
per-runtime confidence and clean fallback (slice 8). This completes
the Ambient direction.
