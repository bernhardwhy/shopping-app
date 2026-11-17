---
name: devils-advocate
description: Perform an adversarial objection pass on a spec or its implementation and return a structured objection record. Use this skill after a spec draft is ready for challenge or after implementation is complete and needs a code-grounded objection review.
argument-hint: "[spec file path] [optional mode: spec|code]"
---

# Devil's Advocate

Run a disciplined objection pass against a spec or the implementation that claims to satisfy it. Return a structured objection record. Do not write code. Do not modify the spec. Do not fill disposition fields.

## Use this skill when

- A spec is ready for adversarial review before planning or implementation
- Completed code needs an objection pass grounded in implementation rather than intent
- The user asks for objections, critical review, challenge review, devil's advocate feedback, or a structured objection record

## Do not use this skill when

- The request is a normal code review better handled by the standard review flow
- The task is to implement or edit code rather than challenge it
- The referenced spec or implementation context is missing

## Inputs

- A spec file path
- Optional mode: `spec` or `code` (default `spec`)
- Any files explicitly referenced by the spec
- In `code` mode, the implementation files changed for the current work item

## Steps

1. Read the spec in full.
2. Read any files the spec explicitly references before raising objections.
3. Determine the mode.
	- Default to `spec`.
	- Use `code` only when the task is to challenge implemented behavior.
4. In `code` mode, read the implementation files changed for the current work item.
	- Ground objections in implementation behavior, not only the spec text.
	- Prefer changed files from source control context when available.
5. Work through these categories in order and ask: "What is the strongest honest objection I can make?"
	1. `premise` - does this solve the right problem?
	2. `design` - does the chosen approach have structural flaws?
	3. `threat` - does this create or ignore trust, abuse, or security gaps?
	4. `failure` - what foreseeable failures are unaddressed?
	5. `operational` - will this be difficult to run or maintain correctly?
	6. `cost` - is the cost disproportionate and unacknowledged?
6. Skip any category that does not meet the evidence bar.
	- Do not manufacture objections.
	- Empty categories are acceptable.
7. Assign a severity before writing each objection.
	- Allowed severities: `major` and `minor`.
	- If severity is unclear, the objection is not ready.
8. Keep each objection atomic.
	- An objection must raise one independently answerable concern.
	- Include only the evidence and consequence for that concern.
	- Split independently resolvable decisions, risks, or questions into separate objections; do not bundle them into a compound objection.
9. Cap the objection list at 12 after splitting compound candidates.
	- If more than 12 candidates exist, keep the strongest evidence-backed objections with the highest severity; omit the rest rather than recombining concerns.
	- Record the number of omitted candidates and their categories in the summary.
10. Produce the objection record using this exact structure.
	- YAML frontmatter including `mode: spec` or `mode: code`
	- Every objection in frontmatter must include `disposition: pending` and `disposition_rationale: null`
	- One prose section per objection with heading format `## O<N> - <category> - <severity>`
	- A closing `Explicitly not objecting to` section with at least three entries
11. Derive the output slug from the spec filename by stripping any date prefix and the `.md` extension.
	- Example: `2026-04-19-devils-advocate.md` becomes `devils-advocate`
	- Spec mode target path: `_wiki/Objections/<spec-slug>.md`
	- Code mode target path: `_wiki/Objections/<spec-slug>-code.md`
12. Return the full objection record to the caller.
	- The caller writes the file.
	- Do not fill or change human disposition fields.

## Output

- The full objection record content, ready for the caller to persist
- A summary with objection counts by category and severity
- When the cap applies, the number of omitted candidates and their categories
- Whether any `major` objections were raised
- The derived output slug
- The mode used: `spec` or `code`

## Validation

- Every objection is evidence-backed and tied to the chosen mode
- Every objection addresses one independently answerable concern
- No more than 12 objections are returned after atomic splitting
- When the cap applies, the summary reports omitted candidate counts and categories
- Every objection has `major` or `minor` severity
- The record includes pending human disposition fields
- The closing `Explicitly not objecting to` section includes at least three entries

## Handoff

- Tell the caller to write the objection record to the mode-appropriate objections path
- Report counts by category and severity
- When the cap applies, report omitted candidate counts and categories
- Report whether any `major` objections were raised
- Report the slug and mode used
