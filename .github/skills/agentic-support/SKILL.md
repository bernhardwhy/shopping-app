---
name: agentic-support
description: Run the Agentic Enablement Companion's Support direction — turn an engineer's request for enablement help (or the assessment's engagement CTA) into a drafted ADO work item anchored to the placement touchstone, or surface a novel local innovation as a candidate common feature (shape, not contents), show it for review, and file it only on explicit confirmation, under the engineer's own identity, to the enablement team. Use when the user says "I need help with X", "raise a support request", "ask enablement", "act on the CTA", "contribute this upward", or "surface this innovation". Drafted by tool, confirmed by human — never files silently; client specifics never leave by default.
---

# Agentic Support — request flow

The **Support** direction of the Agentic Enablement Companion: let an engineer ask for
enablement help without leaving the editor, and have the request reach the
enablement team **with full placement context attached** and **authored under the
engineer's own identity** — so support arrives with context, not as a cold ticket.

It reuses the placement **touchstone** produced by
[`agentic-assess`](../agentic-assess/SKILL.md) and the draft → confirm → file
pipeline that every Up capability builds on. There are two request kinds:

- **`support-request`** — an engineer asks for enablement help.
- **`innovation-candidate`** — surface a novel local habitat/harness
  innovation upward as a candidate common feature, carrying **shape, not
  contents** so client confidentiality is protected by default.

Both share the same pipeline and membrane; they differ only in what is drafted
and, for innovation candidates, in the **redaction allowlist** that governs what
may leave the machine.

## The membrane (read this first)

The defining property of this slice is that **the tool drafts, the human
confirms, and only then is anything filed.** The confirm step *is* the membrane:

- **Nothing is transmitted before an explicit human confirm action.** No silent
  filing, ever.
- **Identity-binding fails closed.** The item is filed under the **engineer's own
  ADO identity**. If engineer auth is absent the flow **stops and explains** — it
  never substitutes a service or shared account.
- The companion is a membrane, not an accountability sink: the human owns the
  decision to send, and the record carries their identity.

## Process

### 1. Read the touchstone and the Support config (deterministic)

Read `.agentic/assess/placement.json` (the placement touchstone written by
`agentic-assess`). If it is missing, say so and suggest running `/agentic-assess`
first — the Support flow anchors to a placement, it does not invent one. Extract at
least:

- `habitatMaturity.level` and `habitatMaturity.weakest`
- `nextMove.move`, `nextMove.dimension`, `nextMove.discipline`
- `habitatBuildGap.regime`

Then read the **Support config** at `.github/skills/agentic-support/config.json` — a small
file that **ships with the skill** (installed alongside `SKILL.md` via the package
and committed, so the org-constant enablement routing travels with the skill
rather than being re-created per repo) — and resolve **`targetTeam`** and
**`parentWorkItemId`** from it. The config is the **only** source of the ADO
organization, project, team, area path, and parent work item:

The config must provide `organization`, `project`, `targetTeam`,
`targetAreaPath`, and a positive-integer `parentWorkItemId`. These values are
**deterministically resolved from the config — never invented by the agent.** If
any is missing or empty, routing is **unresolved**: the flow may still draft for
review, but it **fails closed at the filing gate** (step 4). It does not guess an
organization, project, team, area path, or parent. Say so and point the team at
the config.

### 2. Draft the request (agentic judgement, deterministic envelope)

From the engineer's ask plus the touchstone, draft an ADO work item. The
**phrasing of the ask and the selection of relevant placement context** are the
agentic part; the **envelope and routing** are deterministic. Write the draft to
`.agentic/support/request-draft.json` (create `.agentic/support/` if needed) with this
fixed schema:

```json
{
  "schemaVersion": "1",
  "kind": "support-request",
  "workItemType": "Task",
  "title": "<short ask, e.g. 'Enablement help: stand up observability snapshots'>",
  "body": "<the request, phrased from the engineer's ask + why it matters here>",
  "organization": "<resolved from .github/skills/agentic-support/config.json; null if the config is absent / invalid>",
  "project": "<resolved from .github/skills/agentic-support/config.json; null if the config is absent / invalid>",
  "targetTeam": "<resolved from .github/skills/agentic-support/config.json; null if the config is absent / invalid>",
  "targetAreaPath": "<resolved from .github/skills/agentic-support/config.json; null if the config is absent / invalid>",
  "parentWorkItemId": "<resolved from .github/skills/agentic-support/config.json; null if the config is absent / invalid>",
  "anchor": {
    "habitatMaturityLevel": 3,
    "weakest": ["Observability"],
    "nextMove": "<placement.nextMove.move>",
    "discipline": "<placement.nextMove.discipline>",
    "buildGapRegime": "<placement.habitatBuildGap.regime>",
    "touchstonePath": ".agentic/assess/placement.json"
  },
  "status": "draft",
  "filed": false,
  "filedBy": null,
  "adoId": null,
  "adoUrl": null,
  "blockedReason": null
}
```

The `anchor` block is what makes the request land **with context**: it reproduces
the placement facts so enablement sees where the team is and what move this
supports, not just a free-text plea.

### 3. Show for review (the membrane)

Present the draft in-editor — title, body, ADO routing summary, and the anchored
touchstone summary — and ask the engineer to **edit or confirm**. Do not proceed
to filing on anything other than an explicit confirm action.

### 4. File on confirm — under the engineer's identity (deterministic, fails closed)

Only after explicit confirmation:

- **Resolve the routing target.** `organization`, `project`, `targetTeam`, and
  `targetAreaPath` must already be resolved from
  `.github/skills/agentic-support/config.json` (step 1). `parentWorkItemId` must also
  be a positive integer from that config. If any value is unresolved, **stop**:
  set `filed: false`, `blockedReason: "ADO routing not configured — add
  .github/skills/agentic-support/config.json; not filing"`, and explain in-editor.
  **Never invent a routing coordinate or parent.**
- **Resolve the engineer's own ADO identity.** If it cannot be resolved, **stop**:
  set `filed: false`, `blockedReason: "engineer ADO identity not available — not filing"`,
  and explain in-editor. Never fall back to a service/shared account.
- With the target and identity resolved, create the `Task` **as a child of
  `parentWorkItemId` in the same Azure DevOps operation**, passing the configured
  project and `targetAreaPath`. This creates the hierarchy link atomically; do
  not create an unparented item and add the parent link afterwards.
- Retrieve the created work item and verify its title, `System.TeamProject`,
  `System.AreaPath`, `System.Parent`, and `System.CreatedBy` before reporting
  success. If any value differs from the configured target or engineer identity,
  leave `filed: false`, record the discrepancy in `blockedReason`, and report it
  in-editor.
- Only after verification, record the result back into the draft: `filed: true`,
  `filedBy: "<engineer>"`, `adoId`, `adoUrl`, `status: "filed"`.

### 5. Report in-editor

Confirm what happened: either "filed as #<id> under <engineer>, routed to
<team>" with the link, or the precise reason filing was not performed (no
confirm / no engineer identity). Keep it short.

## Innovation candidates — shape, not contents

When the request kind is `innovation-candidate`, the team is contributing a novel
local element (a constraint, GC rule, or composition pattern it invented) to the
shared catalogue. The same draft → confirm → file pipeline applies, with one
addition that is the **whole point of this mode**: the draft carries **shape, not
contents**, and the engineer sees **exactly what would leave the machine** before
confirming.

### The redaction allowlist (deterministic)

What may leave **by default** is an allowlist of *shape*:

- **Allowed (shape)** — structure, rule **types** (e.g. `deterministic` /
  `agent`), and **counts** (e.g. "one novel constraint + one novel GC rule"); the
  composition **pattern shape** (e.g. "primary + 2 read-only critics"); the
  category of the innovation. No specific values.
- **Withheld by default (contents)** — client names, code, identifiers, endpoints,
  file paths that reveal a client, and any verbatim text. These are **denied**
  unless a human deliberately discloses them at confirm.

The draft for an innovation candidate uses the slice-5 envelope plus three blocks:

```json
{
  "kind": "innovation-candidate",
  "shape": {
    "category": "constraint | gc-rule | composition-pattern",
    "ruleTypes": ["deterministic"],
    "counts": { "novelConstraints": 1, "novelGcRules": 1 },
    "compositionShape": "primary + 2 read-only critics",
    "summary": "<shape-only description — no client specifics>"
  },
  "withheld": ["client-names", "identifiers", "endpoints", "code", "client-paths"],
  "disclosedBeyondShape": []
}
```

`disclosedBeyondShape` is **empty by default**. Any item placed in it is a
deliberate human act performed at the confirm step — never a default, never the
tool's decision. Show the engineer the serialised `shape` (what would be
transmitted) and the `withheld` categories side by side, so the confidentiality
posture is visible *before* they confirm.

This is the strongest confidentiality posture in the product: tool-originated
upward signal is safe because contents beyond shape can only leave by an explicit
human act.

## Membrane & determinacy

- **Membrane**: drafted by tool, confirmed by human. The confirm action is the
  only path to transmission; identity-binding fails closed.
- **Determinacy line**:
  - **Deterministic** — reading the touchstone to attach; **resolving the ADO
    organization, project, team, area path, and `parentWorkItemId` from
    `.github/skills/agentic-support/config.json` (the only sources; never invented;
    fail-closed at the filing gate when unconfigured)**; the draft envelope and
    routing (work-item type, ADO target, parent work-item link, field mapping);
    the gate that no item is filed without a
    confirm action; identity-binding to the engineer's own ADO auth (fail-closed,
    never a service account); **the redaction-allowlist enforcement and shape-only
    serialisation** for innovation candidates.
  - **Agentic** — drafting the request body: phrasing the ask and selecting the
    relevant placement context; **recognising that a habitat element *is* a
    candidate common feature** worth surfacing, and describing it in shape terms.

## Scope

In scope: the **support-request / engagement-CTA** flow (slice 5)
and the **innovation-candidate** flow with shape-not-contents redaction
(slice 6), both on the shared draft → confirm → file pipeline. Out of
scope here: deciding *when* to offer these flows — the Ambient direction
(slices 7–8).
