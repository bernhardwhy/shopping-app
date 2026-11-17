---
description: Discover the target project, guide harness setup decisions, and create or update HARNESS.md using the local harness template.
tools: ['read/readFile', 'edit/createFile', 'edit/editFiles', 'search', 'todo', 'oraios/serena/*']
argument-hint: '[TargetFolder]'
---

## goals
- Discover the provided project folder and build a factual harness baseline.
- Create or update `[TargetFolder]/HARNESS.md` using `.github/harness/templates/HARNESS.md`.
- Preserve the behavior and guardrails of `.github/prompts/harness-init.prompt.md` without requiring slash-command support.

## instructions

You are running the harness initialization flow for `[TargetFolder]`.

Work inside the target project only, except for reading the source prompt and harness template from this repository.

### 1. Use the prompt as the contract
- Read `.github/prompts/harness-init.prompt.md` first.
- Treat that prompt as the source of truth for:
  - discovery scope
  - questions and defaults
  - HARNESS.md generation rules
  - validation rules
  - CI and observability handling
- Follow its process closely, but execute it directly as an agent task instead of asking the user to trigger a slash command.

### 2. Discover before editing
- Perform a read-only discovery pass on `[TargetFolder]`.
- Build the same factual baseline the prompt asks for:
  - stack and manifests
  - linters and formatters
  - CI
  - tests and coverage
  - convention docs
  - pre-commit hooks
  - existing `HARNESS.md` state if present
- Ground all conclusions in repository evidence.

### 3. Make pragmatic defaults when interaction is unavailable
- This agent may run in a non-interactive flow.
- If the user is not actively answering questions, make conservative, explicit defaults based on the prompt rules and discovered tooling.
- Prefer:
  - discovered facts over guesses
  - unverified over invented deterministic enforcement
  - preserving existing real content over replacing it
- When you choose defaults, encode them in `HARNESS.md` and keep them plausible for the repository.

### 4. Generate or update HARNESS.md
- Use `.github/harness/templates/HARNESS.md` as the source template.
- Create or update `[TargetFolder]/HARNESS.md` according to the prompt contract.
- If `HARNESS.md` exists, refresh only the sections the prompt says should be regenerated and preserve content that should remain intact.
- Ensure the template version marker is present and matches `.github/harness/plugin.json`.

### 5. Validate in place
- Re-read `[TargetFolder]/HARNESS.md` after writing it.
- Apply the validation rules from the prompt.
- If anything is missing or inconsistent, fix the file in place.

### 5.1 Remove template copy from the target project
- After `[TargetFolder]/HARNESS.md` is valid, delete `[TargetFolder]/.github/harness/templates/HARNESS.md`.
- Delete only the copied template inside the target project.
- Do not modify the source template in this repository.
- If the file does not exist, continue.

### 6. Keep the result usable for the remaining onboarding flow
- Leave a complete, readable `HARNESS.md` in the target project root.
- Do not stop with instructions to run `/harness-init`.
- The output of this task is the finished file.

## constraints
- Do not simulate missing tools as installed.
- Do not invent formatter, CI, or secret-scanning commands that are not justified by repository evidence or the harness prompt defaults.
- Do not modify files outside `[TargetFolder]`, except reading the source prompt/template from this repository.
- Keep `HARNESS.md` concise and operational.
