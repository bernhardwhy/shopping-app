---
name: agentic-recap
description: Run the Agentic Enablement Companion's Recap direction — given a date range and a repository, read that repo's own in-window git history and return an advisory, de-duplicated digest of the landmark moves that landed, with the moves that touched the working habitat (HARNESS.md, AGENTS.md, skills, CI) flagged. For an engineer returning from an absence who needs to re-orient on what changed while they were away. Use when the user says "catch me up", "what did I miss", "summarise what landed since <date>", "what changed while I was on holiday", "give me something I can share about what landed", or runs /agentic-recap. Advisory and read-only. The recap is local by default; any shareable rendering carries shape, not contents (counts and class labels, never verbatim messages, ids, author names, or client paths), with disclosure beyond shape a deliberate human act. When an Assess placement exists (`.agentic/assess/placement.json`), it closes by relating what landed to that placement and offering Assess's one recorded next move — an offer only, never a filing or run.
---

# Agentic Recap — what landed while you were away

The **Recap** direction of the Agentic Enablement Companion: hand it a **date
range** and a **repository**, and it reads that repo's own **git history** for the
window and returns an advisory digest of the **landmark moves** that landed —
de-duplicated, with the moves that touched the team's working **habitat** flagged.
It is for the engineer coming back from a vacation or other absence who needs to
re-orient on what happened without trawling the log themselves.

The catch-up groups what landed into a **small ranked set of named themes** —
leading with the moves that changed *how we work* — and **anchors** each theme to
its work items / decision records so the engineer can drill from "what changed" to
"why." The deterministic core (enumerate the in-window landmark set, raw git
facts, the habitat-touch flag, the bounded "how we work" set) is unchanged; on top
of it the catch-up structures and anchors:

- **The themes partition the landmarks deterministically.** Every in-window
  landmark belongs to exactly one theme (union = all landmarks, disjoint). The
  **habitat-touching** moves deterministically **seed** the "how we work" themes by
  class and are never merged into an ordinary theme (the hybrid seed). The cluster
  count is capped and must genuinely collapse (not one-theme-per-move).
- **Anchors are extracted deterministically, surfaced agentically.** Whether a
  landmark carries a reference is a fixed regex/path rule; *which* of a theme's
  anchors is the primary drill-down (and the theme names and ranking) is judgement.

## The membrane (the trust property)

The catch-up's load-bearing trust property: it is **read-only and local by
default**, and anything **shareable** carries **shape, not contents**.

- **Local by default.** The full catch-up — the ranked, named themes, their member
  moves, the anchors, and the "why this matters to you" notes — is the **local
  view**. It stays on the machine: the skill **files nothing**, **transmits
  nothing**, and makes **no network call**. Its only ever write is the companion's
  own last-looked watermark (never the target repo).
- **Shareable = shape, not contents.** Git history can contain client specifics
  (verbatim messages, work-item ids, author names, client-revealing paths). When the
  engineer asks for a **shareable** form — to send upward or to a peer — the skill
  emits a **shape-only projection** governed by a fixed **redaction allowlist**
  (counts, class labels, booleans, rank order, window duration) and **withholds all
  contents** by default. **Disclosure beyond shape is a deliberate human act**, never
  the tool's default. This is the same posture `agentic-support` ships for innovation
  candidates — one membrane vocabulary across the companion.

What this enforces, stated honestly: the skill **never originates contents in a
shareable framing** — the shareable projection has **no slot** for a name, subject,
id, path, or date, so no **verbatim-string** content can leak by construction. It is
**not** a claim that "sharing a catch-up is safe" in the absolute: the full-contents
local view sits in the same editor and is equally copyable (the copy channel is the
human's, not the tool's), and low-cardinality shape can still be **identifying** (see
step 10's honest-limits note). The skill offers a safer artefact and names its
limits; it does not police what the human copies. The catch-up adds **no** transmit
or confirm step — the enforced send boundary lives in `agentic-support`'s draft → confirm
→ file flow. See step 10.

## Inputs

- **`from`, `to`** — the window, as calendar dates (`YYYY-MM-DD`). **Optional** —
  when omitted, the window defaults from the last-looked watermark (step 0).
- **target repo** — a path to a real git repository (defaults to the current repo).

## Definitions (the deterministic rules)

These rules — not a hand-picked list — decide what the digest contains.

- **In-window.** A commit is in-window iff its **committer date**, taken as a
  **calendar date in the commit's own timezone**, satisfies `from ≤ date ≤ to`,
  **inclusive at both ends**. (Committer date, because it is the date the commit
  landed on this history; own timezone, so the boundary does not shift under UTC.)
- **Landmark move.** Landmarks are the **first-parent** commits in the window: a
  merge commit collapses its merged-in constituents into **one** landmark named by
  the **merge subject**; a standalone non-merge commit is its **own** landmark; a
  rebased/fast-forwarded feature that landed as several commits with no merge to
  anchor it yields **one landmark per commit**. (`git log --first-parent`
  implements exactly this collapse.)
- **Touched area.** The top-level directory of a changed path. A **root-level
  file** (e.g. `README.md`, `HARNESS.md`) maps to area **`/`**. A **rename** maps
  to **both** the source and destination top-level areas.
- **Commit count vs merge count (disjoint).** The **commit count** counts only
  **non-merge** in-window commits; the **merge count** counts in-window merge
  commits. A merge is never counted in both.
- **Habitat-touch.** A path is a habitat-touch iff it matches the fixed allow-list
  `HARNESS.md`, `AGENTS.md`, `CLAUDE.md`, `.github/skills/**`,
  `.github/workflows/**`, or `azure-pipelines*`. A landmark is **habitat-touching**
  iff any path it introduced matches.
- **Theme + hybrid seed.** A **theme** is a named cluster of one or more in-window
  landmarks. The themes **partition** the landmark set (union = all landmarks,
  pairwise disjoint, each landmark once). The **habitat-touching** landmarks
  deterministically **seed** the "how we work" theme region grouped by class —
  harness/constraint, skills/agents, CI/workflow — and the seed is **not collapsed**
  into an ordinary theme: **no habitat theme contains an ordinary landmark and no
  ordinary theme contains a habitat landmark**. The cluster count is **≤ 5** and
  **strictly fewer than the landmark count**, with **at least one multi-member
  theme** and **singletons ≤ themes − 1** (a genuine collapse, not one-per-move).
  These bounds apply only when there is ≥1 in-window landmark.
- **Anchor (extraction rule, exact).** A landmark carries a reference iff any of its
  constituent commits' **metadata** (subject/body) matches the **work-item regex**,
  **or** the **current-branch rule** applies to it, **or** any path it introduced
  matches the **decision/plan regex**. The surfaced anchor is the matched ref /
  token / path (for the `ADO`, merge-prefix, and branch forms, the id itself).
  - **Work-item regex (deterministic).** A reference is any of —
    - `(?:WORKITEM|FAKEREF)-[0-9]+` — the **synthetic tokens** used in fixtures;
    - `(?:AB)?#[0-9]+` — real ADO refs `#<id>` / `AB#<id>`, as written in commit /
      PR / merge subjects (e.g. `(#<id>)`) and Azure Boards links;
    - `\bADO[ -]?[0-9]+` — the bare **`ADO <id>`** form this team writes in PR
      bodies (a `Why (ADO <id>)` line), which lands in the merge commit **body**;
    - the **leading `<id>:` subject prefix** — a commit / PR subject that **begins**
      with `<id>:` (e.g. E-Akte's `142771: Added a validation helper`), **and** the
      same form inside a squash merge **after stripping** the `Merged PR <pr>: `
      prefix (e.g. `Merged PR 9029: 143605: …` → `143605`). The `<pr>` **directly
      after** `Merged PR ` is the **PR number** and is **never** a work-item ref.

    A bare digit run in any **other** position — no `#` / token / `ADO` prefix, and
    not a leading `<id>:` subject prefix — is **not** a reference.
  - **Current-branch rule (deterministic).** When HEAD is **not** the mainline
    (`main`/`master`) and the final segment of its branch name **begins with**
    `[0-9]+` delimited by `_`, `-`, or end (e.g. `151386_CleanSetup`,
    `152076-real-ado-refs`), that leading id is a work-item ref — attached to every
    in-window landmark reachable from HEAD but **not** from the mainline (the
    **un-merged** work, `<mainline>..HEAD`). It does **not** attach to already-merged
    landmarks, and a branch name with no leading id (e.g. `ae-companion-catchup-s6`)
    yields none. Branch names are **not** retained in a merge's git metadata, so the
    current branch is the only place a branch-name id is available — the returning
    engineer's own in-flight work.
  - **Decision/plan path regex:** `^docs/decisions/[0-9]{4}-[^/]+\.md$`,
    `^_wiki/plans/.+\.md$`, or `^_wiki/UserStories/.+\.md$` (the User Story
    markdowns `sdlc-specify` writes as `_wiki/UserStories/US00X_*.md`, committed then
    often deleted during the PR — still anchored because we read git **history**, not
    the working tree).
  - **Shipped test content** (fixtures, scenarios) uses only the synthetic tokens
    and **short, clearly-non-real** refs (e.g. `#42`, `AB#7`, `ADO 8`, a leading
    `77:` subject, a `Merged PR 100: 4242:` prefix, branch `feature/5150-…`) —
    **never a real 6-digit ADO id** — so extraction is exercised without embedding a
    real reference in the repo.
- **Redaction allowlist (the membrane's shape).** The **only** fields that may
  appear in a **shareable** rendering (step 10). Nothing outside this set may leave.
  - **Allowed (shape):** `landmarkCount`; `themeCount`, and per theme its `class`
    (`how-we-work` | `ordinary`), `habitatClass` (`harness-constraint` |
    `skills-agents` | `ci-workflow` | `null`), `landmarkCount`, and `anchored` (a
    **boolean** — "a drill-down exists", never the drill-down target); the disjoint
    `commitCount` and `mergeCount`; `authorCount` (a **number**, never names);
    `touchedAreaCount` (a **number**, never area names/paths); `windowDays` (the
    window **duration**, never absolute dates); and the theme **rank order** (the
    array order — rank is shape).
  - **Withheld by default (contents):** verbatim theme names; commit/merge subjects
    and bodies; anchor identifiers (work-item ids, decision-record paths); author
    **names**; touched-area **names** / any file paths; absolute dates; and any
    client identifiers, endpoints, or code. **Denied unless a human deliberately
    discloses them.**
- **Touchstone fold (deterministic read + relation; agentic offer).** When
  `.agentic/assess/placement.json` is present and schema-valid, the catch-up **reads**
  it (read-only) and **relates** the in-window how-we-work themes to its lagging
  dimensions — factually (moved / did not move), weighted by the watermark absence
  gap — then **offers exactly one** next move: the placement's recorded `nextMove`,
  contextualised, **as an offer only** (never a competing move, never a filing or
  run). An **absent or malformed** placement means the fold is **skipped** and stated
  plainly, never invented. The offered move is **local-view contents** — it never
  appears in the shareable projection.

## Process (deterministic)

Use only the **read-only** git sub-commands in the allow-list below. Run each
against the target repo with `git -C <repo>`. The **only** write the catch-up makes
is the last-looked watermark (steps 0 and 9) — the companion's own state under
`.agentic/recap/`, never the target repo.

### 0. Resolve the catch-up window (deterministic)

Resolve the window *before* reading history, by this precedence:

1. **Explicit `from`/`to` given** → use `[from, to]` **verbatim** on the
   own-timezone calendar-date convention of step 1 (a one-off look). Does **not**
   advance the watermark.
2. **No explicit range + a valid watermark** at `.agentic/recap/lastlooked.json`
   → resolve the **half-open instant window `(lastRunAt, now]`**, comparing
   committer **instant** in **UTC** (`now` = the run instant, normalised to UTC).
   Half-open at the lower bound means a commit that landed *after* the last read but
   shares `now`'s date appears exactly once across runs — never skipped, never
   double-counted. If `now < lastRunAt` (a backward clock), treat as an **anomaly**:
   report nothing landed, **do not advance**, and say the clock is behind the
   last-looked instant.
3. **No explicit range + no valid watermark** → do **not** invent a window. Make a
   clearly-labelled **confirmed offer** ("no last-looked point yet — show the last
   `FIRST_RUN_OFFER_DAYS` (14) days? or give a range") and run **only** over a
   confirmed window. A **malformed** watermark (invalid JSON / missing or
   non-instant `lastRunAt`) is surfaced **distinctly** as "prior watermark
   unreadable — re-establishing", then treated as no usable cursor.

The watermark schema (fixed; `.agentic/` companion state, same family as
`agentic-assess`'s `placement.json`) is in
[`references/watermark.schema.json`](references/watermark.schema.json).

`lastRunAt` (the exact UTC read instant covered) is **load-bearing** — it resolves
the next default window (and an absence gap is `now − lastRunAt`); `lastLooked` is
its UTC date, human-facing only.

### 1. Enumerate the in-window landmarks

- `git -C <repo> log --first-parent --pretty='%H%x09%cI%x09%an%x09%s'`
- Keep rows whose `%cI` calendar date (its first 10 characters — the commit's own
  timezone) is within `[from, to]` inclusive. Each kept row is a **landmark**; its
  `%s` is the landmark name (a merge row is named by its merge subject).

### 2. Surface the raw git facts

- **Authors** — the distinct `%an` across **all** in-window commits
  (`git -C <repo> log --pretty='%cI%x09%an'`, filtered to the window).
- **Touched areas** — from `git -C <repo> show --name-status -M --pretty=format: <sha>`
  for each in-window non-merge commit: map each changed path to its area (top-level
  dir; root file → `/`; a rename → **both** source and destination areas). Report
  the distinct set.
- **Counts** — non-merge **commit count** = in-window commits from
  `git -C <repo> log --no-merges`; **merge count** = in-window commits from
  `git -C <repo> log --merges`. Report both; they are disjoint.

### 3. Flag habitat-touching landmarks

- For each landmark, take the paths it introduced (`git -C <repo> show --name-only
  --pretty=format: <sha>`; for a merge landmark use `git -C <repo> diff --name-only
  <sha>^1 <sha>` — the changes it brought to the mainline). Flag the landmark
  **habitat-touching** iff any path matches the habitat allow-list.

### 4. Identify the "how we work" set (the deterministic seed)

- The habitat-touching landmarks (by class) plus any non-habitat landmark you
  **explicitly admit** as assumption-changing **with a stated rationale** form the
  "how we work" set. A routine edit (a doc tweak, a rename, a value change) is
  **not** admissible. These seed the high-cost themes; ordinary non-admitted moves
  are themed separately and never merged into a "how we work" theme. Each how-we-work
  move keeps a short **"why this matters to you"** note (the constraint now in
  force, the skill/agent now available, the CI gate now enforced) — not a
  restatement of the commit subject.

### 5. Group the landmarks into a small ranked set of named themes

- **Seed (deterministic).** The habitat moves seed the "how we work" themes by
  class — harness/constraint → skills/agents → CI/workflow. Never merge a habitat
  move into an ordinary theme, nor an ordinary move into a habitat theme.
- **Refine (agentic).** Cluster the ordinary moves into coherent themes (by
  topic/area), and **name** each theme for its cluster — not by a commit subject.
  Respect the cap: **≤ 5 themes**, fewer than the landmark count, **≥ 1
  multi-member theme**, **singletons ≤ themes − 1** — a genuine collapse, never
  one-theme-per-move nor one giant theme.
- **Rank (agentic).** Order the themes by re-learning cost — a theme carrying
  habitat / assumption-changing moves outranks a purely-ordinary theme. Do **not**
  rank by commit volume or recency (so a high-volume ordinary theme never outranks
  a how-we-work theme).

### 6. Extract and attach anchors

- **Extract (deterministic).** For each landmark, extract references per the
  **Anchor** rule: the work-item regex over commit metadata (the synthetic tokens;
  real ADO refs `#<id>` / `AB#<id>`; the bare `ADO <id>` body form; and a leading
  `<id>:` subject prefix, incl. after a `Merged PR <pr>: ` prefix), the
  decision/plan path regex (incl.
  `_wiki/UserStories/**`), and the **current-branch rule**. For the last, read
  HEAD's branch (`git -C <repo> rev-parse --abbrev-ref HEAD`); if it is not the
  mainline and carries a leading id, attach that id to the un-merged in-window
  landmarks (`git -C <repo> rev-list --first-parent <mainline>..HEAD`). A bare digit
  run in any other position is not a reference.
- **Attach (deterministic floor).** Every extracted reference MUST appear in the
  **anchor slot** of the theme that contains its landmark (the theme's header /
  anchor line — a usable drill-down), **never** buried in member prose or a
  trailing dump.
- **Select the primary (agentic).** When a theme has several anchors, present the
  most **material** as the primary drill-down; do **not** present a noise/irrelevant
  reference as primary.

### 7. Empty window

- If no commit is in-window, say plainly **"nothing landed in `[from, to]`"** —
  no themes, no fabricated anchors, no error.

### 8. Present the structured catch-up

- Present the **themes in rank order**. For each theme: its **name**, its
  **anchor(s)** (the primary drill-down first), and its member moves — with the
  "why this matters to you" note on the how-we-work moves. Nothing is dropped:
  every in-window landmark appears in exactly one theme.
- Then the facts: authors, touched areas, and the commit/merge counts. Frame the
  whole as an advisory re-orientation, not a to-do list.

### 9. Advance the last-looked watermark (deterministic; default runs only)

After a **successful default (watermark-derived) run** — including a confirmed
first-run offer — **advance** the watermark: write `lastRunAt = max(now, lastRunAt)`
(the read instant; never regress) and `lastLooked` = its UTC date. The first
successful run with no prior valid watermark **bootstraps** `lastRunAt = now`
(always `now`, never an explicit range's `to`). An **explicit-range** run and an
**anomaly** run (`now < lastRunAt`) do **not** advance. Write **atomically** — a
temp file in `.agentic/recap/`, then rename over `lastlooked.json` — so a partial
write can never half-clobber a good watermark. Assume single-active-runtime
(last-writer-wins).

### 10. Shareable rendering — on request, shape not contents (the membrane)

The default output is the **local view** (steps 5–8): the full themed, anchored
catch-up, in-editor, staying on the machine. Emit a **shareable** rendering **only**
when the engineer explicitly asks for one ("give me something I can share",
"summarise this to send upward"). The shareable rendering is a **shape-only
projection** of the same catch-up, governed by the **redaction allowlist**:

- **Project deterministically** from the facts already computed (steps 1–6): the
  counts, the disjoint commit/merge counts, the author **count**, the touched-area
  **count**, the window **duration in days**, and — per theme — its `class`,
  `habitatClass`, `landmarkCount`, and an `anchored` **boolean** (whether the theme
  has ≥1 extracted anchor). Preserve the theme **rank order** (the array order). The
  per-theme `landmarkCount` values **sum to** `landmarkCount`.
- **Withhold all contents.** The projection has **no field** for a theme name,
  subject, anchor id, author name, area name, or absolute date — so no
  **verbatim-string** content can leak by construction. The fixed `catchup-shape`
  schema is in
  [`references/catchup-shape.schema.json`](references/catchup-shape.schema.json):
  a top-level object of counts (`landmarkCount`, disjoint `commitCount`/`mergeCount`,
  `authorCount`, `touchedAreaCount`, `themeCount`), `window.days`, a `themes` array
  (per theme: `class`, `habitatClass`, `landmarkCount`, `anchored`), the `withheld`
  category list, and `disclosedBeyondShape` (empty by default).

- **`disclosedBeyondShape` is empty by default — and stays empty in what the tool
  emits.** The tool never populates it; it is a **posture marker** showing that
  nothing beyond shape has been disclosed. Disclosure beyond shape is a **deliberate
  human act**: the engineer **edits the emitted artefact** to add a named entry. When
  the engineer asks to "share, but include a bit of context," treat that as a request
  for **contents** — a theme name, subject, or anchor is contents, and a client name
  or client-revealing path (`clients/<name>`, an endpoint) is contents doubly —
  **decline to auto-include it**, emit the shape, and point the engineer at the
  deliberate-edit path. Never wave contents through as if they were a harmless class
  label.
- **Present in-editor; do not persist.** Show the serialised `shape` and the
  `withheld` categories side by side so the confidentiality posture is visible
  *before* the human copies anything. The shareable rendering is **not written to
  disk** — the skill's only ever write remains the watermark, so an explicit-range
  run still makes **no** filesystem write and nothing is filed or transmitted.
- **State the honest limits (do not over-claim "safe").** The by-construction
  guarantee covers **verbatim strings** only. Two residual channels remain and must
  be named to the engineer, not hidden: (a) **low-cardinality shape is still
  identifying** — a `themeCount = 1`, single `harness-constraint` how-we-work theme,
  `authorCount = 2`, `windowDays = 5` signature can re-identify a specific small
  engagement to someone who knows the cohort; the counts + `habitatClass` sequence +
  rank order act as a **joint fingerprint** even with zero strings; (b) the
  full-contents **local view is equally copyable** in the same editor. Shape is
  *materially* safer than contents and is the right default — but deliberate
  disclosure, and the decision to share at all, remain the human's judgement. (A
  runtime small-cohort guard — suppress/coarsen shape below a cardinality threshold —
  is a candidate future enhancement.)

### 11. Fold into the steer touchstone — offer one next move (on presence)

Part of the **local view**, run after the catch-up is presented (steps 5–8), only
when the steer placement exists. It is **never** part of the shareable projection —
an offered move is *contents*, and the projection has no slot for it.

- **Read the touchstone (deterministic, read-only).** If
  `.agentic/assess/placement.json` is present and **valid**, read
  `habitatMaturity.weakest` (the lagging dimensions), `dimensions`,
  `cognitive.disciplines`, `habitatBuildGap`, and the steer's recorded `nextMove`.
  **Valid** = parseable JSON with `schemaVersion` `"1"` and a `habitatMaturity.weakest`
  array; `nextMove` is **optional** (a placement may record none). **Malformed** =
  unparseable JSON, a wrong/absent `schemaVersion`, or a missing
  `habitatMaturity.weakest` — treated **exactly like absent**. On absent **or**
  malformed, say so plainly ("no steer placement yet — run `/agentic-assess` to place
  the repo") and **skip** the fold; never invent a placement. This adds **no** write —
  the only write remains the watermark.
- **Relate (deterministic).** Cross the in-window **how-we-work** themes against the
  placement. Only three habitat classes map cleanly to a placement dimension —
  **harness/constraint → Governance** (Guardrail discipline), **skills/agents →
  Agent behaviour**, **CI/workflow → Workflow**. For each **mappable** weakest
  dimension, state **factually** whether a landed move touched it — "while you were
  away, the team advanced <dimension> (flagged weakest at your last placement)" — or
  that it **did not move** ("<dimension> is still where it was"). A weakest dimension
  with **no habitat-class mapping** (e.g. **Observability** — a CI build/test workflow
  file evidences **Workflow**, not Observability) is reported as **"no observable
  in-window move"**, never as advanced. This is a factual link, **not** a re-scoring;
  the catch-up does not re-derive the placement.
- **Weight by the absence gap (deterministic).** Use the watermark **absence gap**
  (`now − lastRunAt` from step 0 — the figure the watermark step already computes) as context and
  state it ("you were away ~<N> days"); a longer absence makes an unaddressed lagging
  dimension more salient. It informs **emphasis only** — it never fabricates movement.
- **Offer one move (agentic) — offer only.** Close with **exactly one** next move:
  the steer's own recorded `nextMove`, **contextualised** by what landed ("still
  stands", or "partly addressed by <theme> — the remaining step is …"). The catch-up
  **never invents a competing move**, and it **files nothing and runs nothing** — it
  is an **offer**, consistent with the advisory boundary. If the placement records no
  `nextMove`, offer none and say the placement carried no pending move.

## Scope & boundaries

**In scope:** range + repo → the de-duplicated landmark digest; the
raw git facts; the **habitat-touch flag**; the bounded "how we work" set, ordered
by re-learning cost and framed; a **small ranked set of named themes**
(habitat-seeded, deterministically partitioned and capped) with each theme
**anchored** to its work items / decision records; a **self-advancing,
instant-based last-looked watermark** (`.agentic/recap/lastlooked.json`) so the
range **defaults to "since you last looked"** when none is given; **and** the
**membrane** — the catch-up is read-only and local, and any **shareable** rendering
is a **shape-only projection** (counts, class labels, booleans, rank order, window
duration) governed by a **redaction allowlist** that withholds all contents by
default, with **disclosure beyond shape a deliberate human act**; **and** the
**steer-touchstone fold** — when `.agentic/assess/placement.json` exists, relate the
in-window how-we-work themes to its lagging dimensions (weighted by the watermark
absence gap) and offer **one** next move — the placement's recorded `nextMove`,
contextualised, **as an offer only** (never a competing move, a filing, or a run;
absent/malformed placement → the fold is skipped, not invented). Self-contained,
git-grounded, advisory, target-repo read-only.

**Out of scope — deliberate boundaries:**

- **Ambient triggering** — offering a catch-up on return from an absence is
  deliberately not included; revisit once the companion's ambient layer stabilises.
- **A transmit / file flow** — the membrane produces a shareable *form*; actually
  sending an upward signal is `agentic-support`'s territory.

The agentic parts (clustering beyond the seed, theme names, theme ranking,
primary-anchor selection, **recognising a "share with context" request as a request
for contents and declining to auto-include them**, **and contextualising the single
offered move against what landed**) sit on a
**deterministic floor** — the hybrid seed,
the partition + cap + distribution bounds, the anchor extraction + attachment, the
preserved "how we work" set, the watermark arithmetic, the shape-only
projection + redaction-allowlist enforcement, **and the touchstone read + relation
(and the reuse of the placement's own `nextMove` — no invented move)**. The catch-up
persists **only** the companion-state watermark, presents any shareable rendering
**in-editor without persisting it**, offers the touchstone move **without filing or
running anything**, and must still not transmit or mutate the target repo.

## Membrane & determinacy

- **Membrane** — advisory, local; **the target repo is read-only**, and anything
  **shareable carries shape, not contents**. The **only** write is the
  companion-state watermark `.agentic/recap/lastlooked.json` (same family as
  `agentic-assess`'s `placement.json`); the skill **files nothing**, **transmits
  nothing**, and makes **no network call**. It also **reads** (read-only)
  `.agentic/assess/placement.json` when present, for the touchstone fold — a read,
  never a write, and the fold offers a move but files/runs nothing. The default output is the **local view**
  (full contents, in-editor); a **shareable** rendering is emitted only on request as
  a **shape-only projection** (the redaction allowlist), presented **in-editor and
  not persisted**, with **`disclosedBeyondShape` empty by default** so disclosure
  beyond shape is a deliberate human act. The target repo's `git rev-parse HEAD` and
  `git rev-list --all --count` are **byte-identical** before and after,
  **unconditionally**. `git status --porcelain` stays **empty given the precondition
  that `.agentic/` is gitignored** — satisfied here, and a **companion-wide install
  requirement** (the CLI must ensure that ignore entry in target repos; tracked
  separately) shared by every direction that writes `.agentic/` state.
- **Read-only git allow-list** — the skill uses only `git log`, `git show --stat`
  (and `--name-only` / `--name-status`), `git rev-list`, `git rev-parse` (incl.
  `--abbrev-ref HEAD` for the current-branch rule), and `git diff --name-status`. It
  runs no command that writes refs, objects, the index, or the working tree.

The deterministic-vs-agentic split is stated once, in the process steps and in
"## Definitions (the deterministic rules)" — it is not restated here.
