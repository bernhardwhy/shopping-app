---
name: agentic-assess
description: Run the Agentic Enablement Companion's grounded assessment — place the current repository on the Agentic Experience 5-Level Habitat Maturity Model from its own habitat files, return one single next move, and persist a placement touchstone. Use when the user asks to assess the repository, "where are we / what next", "place us on the maturity model", or runs /agentic-assess. The companion's assessment direction; self-contained — the model, cognitive ladder, and scoring are embedded below.
---

# Agentic Assess — grounded assessment

The **Assess** direction of the Agentic Enablement Companion: place a team on the
Agentic Experience maturity model from what it is *actually* doing, and assess it
to its single highest-leverage next move — in-editor, in under ten minutes.

This skill is **self-contained**: the model and scoring are embedded below
(EMBED decision). It does not read from another plugin, repo, or
service at runtime.

> **Provenance (product source only).**
> The Agentic Engineering product repository checks in CI that this embedded
> instrument's recorded source provenance is current. The verifier depends on
> product-only wiki files and is intentionally not included in installed
> consumer copies.
>
> Embedded instrument, vendored from this repo's wiki:
> - 14-dimension 5-level maturity model — `_wiki/model/agentic-maturity-model.md`
> - six-level cognitive ladder + three disciplines + Habitat Build Gap — `_wiki/model/cognitive-ladder.md`
> `instrument-version: 0.2.0`

## Scope of this slice (be honest about it)

In scope (the full **Down** direction):
- Scan the habitat **and the broader signal surface** (CI, tests, agents/skills,
  plans/specs, …), recording presences **and absences**.
- Place all eight **repo-observable** dimensions evidence-first (cited markers).
- Run a short **clarifying journey** (3–5 questions, one at a time) to place the
  six **behavioural** dimensions from answers.
- Add the **Sovereign Engineer cognitive read** (level + three disciplines) and
  the **Habitat Build Gap**; match the single next move to the weakest discipline.
- Fold in **live-session signal** where the runtime exposes it, and **declare
  confidence per runtime**, degrading cleanly to habitat+answers when there is none.
- Persist the placement touchstone at `.agentic/assess/placement.json`.

Out of scope — these are the companion's **other directions**, shipped as
separate skills, not deferred work of this assessment:
- **Support** — draft→confirm→file a support request / innovation candidate to the
  enablement team (slices 5–6) — see [`agentic-support`](../agentic-support/SKILL.md).
- **Check-in** — deciding *when* to re-assess or nudge (slices 7–8) — see
  [`agentic-check-in`](../agentic-check-in/SKILL.md).

## The model (embedded) — Agentic Experience 5-Level Habitat Maturity Model

Fourteen dimensions, each placed L1–L5. Report each placement with the model's
own **verb** — the verb *is* the finding.

| Dimension | L1 | L2 | L3 | L4 | L5 |
|---|---|---|---|---|---|
| **Agent behaviour** | Dictating | Commanding | Regulating | Orchestrating | Supervising |
| **Agent input** | short ad-hoc prompts | larger prompts/commands | plans co-authored | iteratively refined specs | specs + observable metrics |
| **Workflow** | safe runtime, generic | prompts/commands saved | harness engineered | workflow defined | workflow automated |
| **Operating model** | Chat | Prompt-engineering | drive / verify | in the loop | certify |
| **Teams provide** | — | basic constitution | comprehensive product constitution | full product constitution | custom product runtime |
| **Output role** | Running | Inspecting | Standardising | Specifying | Certifying |
| **Output artefact** | executable/artifact | code | process & consistency rules | clear criteria | evidence |
| **Humans review** | output only | code | implementation in detail | specs | comprehensive evidence |
| **Work patterns** | partial task | small task | e2e development | semi-autonomous | mostly-autonomous |
| **Agent composition** | single | single + saved patterns | primary + read-only critics | bounded ensemble | self-orchestrating constellations |
| **Agents…** | Assist | Complete basic tasks | Develop (stories) | Implement (epics) | Implement autonomously |
| **Testing** | Manual | Asserting | Verifying | Validating | Assuring |
| **Observability** | Eyeballs | Captured | Instrumented | Aggregated | Closed loop |
| **Governance** | trust-based | conventional | Constitutional | Policy-as-code | Continuous certification |

Dimensions are placed **L1–L5** — L1 is the "ad-hoc but present" floor. A repo
with essentially no AI-collaboration evidence sits at L1 across the board.

### Repo-observable vs behavioural

**Eight dimensions are repo-observable** — place each evidence-first from the
scan, citing the path + marker:

- **Workflow** — saved prompts/commands ⇒ L2; a harness document (`HARNESS.md`)
  engineered with context + constraints + GC rules ⇒ L3; a defined multi-step
  workflow / CI pipeline ⇒ L4; automated/self-triggering ⇒ L5.
- **Teams provide** — presence + richness of `AGENTS.md`/`CLAUDE.md` (basic →
  comprehensive → full constitution); product-specific skills; custom runtime ⇒ L5.
- **Agent input** — ad-hoc prompts (L1); saved prompt/command libraries (L2);
  plan documents / `_wiki/plans/` (L3); a `specs/` directory, specs separate from
  plans (L4); specs + observable metrics (L5).
- **Output artefact** — raw artifacts (L1); code (L2); process & consistency
  rules — `HARNESS.md`, style guides (L3); acceptance-criteria docs (L4);
  evidence/audit artefacts (L5).
- **Agent composition** — count/shape of custom agents; read-only critic agents;
  an orchestrator with gates; agent-team docs; multi-agent workflow scripts.
- **Testing** — test suites present (L2); coverage enforcement / mutation tests
  (L2–L3); tests-before-merge CI gates, system/regression suites (L3–L4);
  agent-authored tests, prod-like envs (L5).
- **Observability** — agent-activity logging; metrics capture; dashboards;
  snapshots at a cadence; per-PR acceptance / mutation-kill tracking; closed-loop
  signals (L5). A declared cadence with nothing captured is the **L1 floor**.
- **Governance** — `HARNESS.md` constraint count + enforcement ratio; the
  unverified → agent → deterministic promotion ladder; policy-as-code in CI (L4);
  continuous certification (L5).

Record **absences** too (no `specs/` directory, no `MODEL_ROUTING.md`, no
observability snapshots, …) — an absence is evidence for a placement.

**Six dimensions are behavioural** (Agent behaviour, Operating model, Output
role, Humans review, Work patterns, Agents…). The filesystem cannot see them —
place them from the **clarifying journey** (Process step 2) and mark each
`basis: "answer"`. Where one cannot be answered, fall back to inference from the
repo-observable dimensions and mark it `(inferred)`.

## The cognitive read (embedded) — Sovereign Engineer ladder + Build Gap

Folded in alongside the model: what the team can *think and do*.

### Six-level cognitive ladder (L0–L5)

| Level | Name | Visible in the repo when… |
|---|---|---|
| **L0** | Aware of the landscape | AI may be used but nothing in the repo encodes it |
| **L1** | Communicating through prompts | some AI-instruction file exists, usually thin |
| **L2** | Verification discipline | + deterministic guardrails (CI lint, coverage, hooks) |
| **L3** | Habitat design | + a persistent habitat: rich AGENTS.md/HARNESS.md, skills, reflection log, ADRs |
| **L4** | Specification-led | + specs first-class (`specs/`), spec-first ordering, adversarial review |
| **L5** | Sovereign engineering | + platform practice: published templates/plugin, governance audit, fitness functions, cost/model routing |

### Three disciplines (score each 0–5)

- **Context Engineering** — how accumulated wisdom is encoded into the agent's
  context (instruction files, skills, onboarding, reflection→curation).
- **Architectural Constraints** — how structural rules are made machine-checkable
  (HARNESS.md, CI gates; deterministic vs agent vs by-convention).
- **Guardrail Design** — the feedback loops that catch drift (tests, hooks,
  adversarial review, plan/integration gates).

**Cognitive level** = the highest level with substantial evidence across **all
three** disciplines; the weakest discipline is the ceiling (strong specs + weak
verification is L2, not L4).

### Habitat Build Gap

```
Habitat Build Gap = cognitive_level − habitat_maturity_mean   (mean of all 14 dims)
```

| Gap | Regime | Meaning |
|---|---|---|
| `abs(gap) < 0.5` | **Coherent** | team and habitat at the same level |
| `gap ≥ +0.5` | **Ambition outpaces enablement** | build the habitat the thinking implies |
| `gap ≤ −0.5` | **Inherited habitat** | literacy uplift before more harness |

## Live session & runtime confidence (embedded)

Session visibility differs by runtime, so the steer **declares its confidence**
rather than over-claiming:

| Runtime | Session confidence |
|---|---|
| Claude Code | **high** |
| GitHub Copilot CLI | **partial** |
| VS Code runtime | **partial** |
| unknown / no session | **habitat-only** |

When a runtime exposes session signal (e.g. ad-hoc prompting vs spec-driven
work), fold it into the placement and note it. When it does not, **degrade
cleanly**: fall back to habitat + answers, set confidence `habitat-only`, and say
the session was not consulted. Habitat evidence dominates when session visibility
is low. **Never claim a session read that did not happen.**

## Process

### 1. Scan (deterministic)

- Read `HARNESS.md` and `AGENTS.md`/`CLAUDE.md` in `[TargetFolder]`. If no habitat
  files exist, say so plainly — the steer is then "L1 floor, no habitat evidence
  yet" and the next move is "establish a HARNESS.md".
- Then scan the **broader signal surface**, recording presences **and absences**
  (cite path + marker for each present signal; note each notable absent one): CI
  workflows (`.github/workflows/`, `azure-pipelines.yml`); test suites + coverage
  thresholds; pre-commit hooks; custom `agents/`/`skills/`/`commands/`;
  `_wiki/plans/` and any `specs/` directory; decision records; `MODEL_ROUTING.md`
  / cost discipline; observability snapshots.
- Extract structured facts from `HARNESS.md`: constraint `Enforcement` values and
  the enforced/total ratio; GC rules; observability cadence; named sections.
- **Detect the runtime** hosting this session and read any session signal it
  exposes; set `confidence` per the table above (`habitat-only` if unknown).

### 2. Present & ask (the clarifying journey)

- Present the scan as a short structured summary, then ask **3–5 clarifying
  questions, one at a time** — wait for each answer before the next. Prioritise
  the six **behavioural** dimensions the filesystem cannot see:
  - *Operating model / Humans review / Output role* — what do you actually
    inspect before accepting work: the output, the code, or the evidence?
  - *Work patterns / Agents* — is a unit of work a partial task, a whole story,
    or a multi-step epic?
  - *Agent behaviour* — how directive vs supervisory are you while it runs?
- Spend a question on the weakest-evidenced area rather than guessing.

### 3. Place (deterministic rubric + answers)

- Place **all eight repo-observable dimensions** evidence-first using the evidence
  map above, citing a path/marker for each.
- Place the **six behavioural dimensions from the answers** (`basis: "answer"`);
  any not answered fall back to inference (`basis: "inferred"`).
- Read the **Habitat Maturity Level** = rounded mean of all 14 placements, and
  **name the weakest dimension(s) as the ceiling**.
- Apply the **cognitive read**: score the three disciplines 0–5, take the
  cognitive level as the highest with substantial evidence across all three
  (weakest discipline is the ceiling).
- Compute the **Habitat Build Gap** = cognitive level − 14-dim mean, and label
  the regime (Coherent / Ambition outpaces enablement / Inherited habitat).
- Where session signal is available, **fold it into the relevant dimensions**
  (e.g. observed ad-hoc vs spec-driven work); when it disagrees with the habitat
  read, reconcile, re-choose the move, and note the disagreement. When session
  visibility is low, habitat evidence dominates.

### 4. Steer (agentic judgement)

- Choose **one** single next move, matched to the **weakest discipline** (and a
  named lagging dimension). The placements, discipline scores, and gap arithmetic
  are deterministic; the choice of the single move is judgement. Give a one-line
  rationale.

### 5. Persist the touchstone (deterministic)

Write `.agentic/assess/placement.json` with this fixed schema (create the
`.agentic/assess/` directory if needed). Later companion capabilities read it.

```json
{
  "schemaVersion": "1",
  "generatedAt": "<ISO-8601 timestamp>",
  "evidenceBasis": "habitat + clarifying answers + live session (confidence per runtime)",
  "sessionSignal": { "runtime": "claude-code", "confidence": "high", "observed": "<what the session showed, or 'session not consulted'>" },
  "habitatMaturity": { "level": 3, "mean": 2.8, "weakest": ["Observability"] },
  "scan": { "absences": ["no specs/ directory", "no MODEL_ROUTING.md", "no observability snapshots"] },
  "dimensions": {
    "Agent behaviour": { "level": 3, "basis": "answer" },
    "Workflow":        { "level": 3, "basis": "evidence", "evidence": ".github/workflows/ci.yml + HARNESS.md" },
    "Governance":      { "level": 3, "basis": "evidence", "evidence": "HARNESS.md Status: enforced ratio" }
  },
  "cognitive": {
    "level": 3,
    "name": "Habitat design",
    "disciplines": { "Context Engineering": 3, "Architectural Constraints": 3, "Guardrail Design": 2 }
  },
  "habitatBuildGap": { "value": 0.2, "regime": "Coherent" },
  "nextMove": {
    "dimension": "<lagging dimension>",
    "discipline": "Guardrail Design",
    "move": "<one concrete next step>",
    "rationale": "<one line>"
  },
  "deferred": [],
  "instrument": { "source": "agentic-experience-14dim + sovereign-cognitive-ladder", "version": "0.2.0" }
}
```

When the runtime exposes no session, set
`"sessionSignal": { "runtime": "unknown", "confidence": "habitat-only", "observed": "session not consulted" }`
and keep `evidenceBasis` honest ("…no live session").

### 6. Report in-editor

Present, briefly: the placement (level + weakest dimension), the cognitive level
and the Build Gap regime, the single next move (matched to the weakest
discipline) with its rationale, and an explicit **confidence note** stating the
runtime and its session confidence (e.g. "session: high (Claude Code)" or
"habitat-only — session not consulted"). Point to the written touchstone path.
Keep the whole thing under ten minutes.

## Membrane & determinacy

- **Membrane**: this slice is read-only and local. Nothing is filed, transmitted,
  or sent anywhere — output is advisory text plus the local touchstone file. (The
  Up direction's draft→confirm→file flows are separate slices.)
- **Determinacy line**: scanning/parsing, the evidence→level rubric, the Build
  Gap arithmetic + regime thresholds, **runtime detection and the per-runtime
  confidence label**, and the touchstone serialisation are **deterministic**;
  interpreting free-text answers into behavioural levels, the cognitive-evidence
  judgement, **reconciling session vs habitat when they disagree**, and choosing
  the single next move are **agentic judgement**.
