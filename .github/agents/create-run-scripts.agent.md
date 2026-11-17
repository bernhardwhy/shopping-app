---
description: "Create run scripts, in the format specified by the calling instructions, for building, starting, and testing the project."
tools: ['search/codebase', 'edit/editFiles']
argument-hint: '[TargetFolder]'
---

# Create Run Scripts agent

Goal
----
Produce run scripts that standardize build, start, dependency installation, and test tasks for this repository, in the run-script format(s) named by the calling instructions (for example: npm scripts, POSIX shell, Windows Batch, or PowerShell — the calling instructions may name more than one when this project maintains real, platform-specific automation for each), or, when the calling instructions instead describe a custom format/tooling in the user's own words, whatever real format or tool that description points to.

Before anything else, check `[TargetFolder]/.agentic/run-script-discovery-report.md`. If it exists, read it as a starting hint — the detected formats and their evidence, the deterministic safe-pair/collision detail, and the format or custom description the user actually chose. Treat it only as a hint: still perform your own full analysis of the target project exactly as described below, with no reduction in rigor. Once run scripts are generated (or this task concludes as a no-op because every task was skipped), delete `.agentic/run-script-discovery-report.md` if it exists — leave the rest of `.agentic/` untouched, since it is shared product state that may hold other files.

Required outputs
----------------

- Place scripts under `[TargetFolder]/scripts/` named `run_<task>.<ext>`, where `<ext>` is the extension for the requested format (`.js` for npm scripts, `.sh` for POSIX shell, `.cmd` for Windows Batch, `.ps1` for PowerShell). Examples: `run_build.<ext>`, `run_start.<ext>`, `run_tests.<ext>`, `run_installpackages.<ext>`. When the calling instructions describe a custom format/tooling instead of naming one of those four, there is no CLI-known extension to fall back on: pick whatever file extension and invocation mechanism is actually appropriate for that description and the project's real files (e.g. a `.rb` wrapper calling `rake` for "Ruby via Rake"), bound by the same real-source, non-placeholder verification rule below as every other format.
- Before generating any `run_<task>.<ext>`, read every real candidate source named in the calling instructions for this project (a `package.json` `scripts` field, a `composer.json` `scripts` field, a `Makefile`/`make.ps1`'s own targets/functions, or any other named registry/build file). Generate `run_<task>.<ext>` as a thin wrapper around a real command from one of those sources only when that command plausibly matches the task (its name or a realistic variant) and its content actually looks like it performs that task — not an unrelated task, and not a placeholder (for example `echo "no test required"`, a bare `exit 0`, or a comment with nothing else), even on an exact name match. Group your real candidate sources by which requested format they belong to. Within one format, combine every real, plausible match for a task into one wrapper (e.g. `composer test && npm test`). Across different requested formats, treat each independently: generate that format's wrapper for a task only when that format's own sources have a real, plausible, non-placeholder match. It is normal and correct for a task to end up covered in some requested formats and not others — never invent a command in one format just to match another's coverage. If no source plausibly covers a given task in a given requested format, skip that specific generated script rather than wrapping a non-existent, unrelated, or placeholder one. If **no** suggested task has a plausible match at all, generate no `scripts/run_*.<ext>` files and instead add the fallback note described in "Repository instruction" below.
- Beyond the source(s) named above, also look at the repository more broadly for other real, independent test/build subsystems the calling instructions did not name (for example, a nested app with its own `package.json` under a project whose root-level format resolved to something else entirely). When such a subsystem can reasonably be chained into the same generated script — in a sensible order, e.g. unit tests before integration/acceptance tests before anything with a heavier runtime dependency — include it. When it genuinely cannot (it needs a browser, Docker, or a different SDK the current wrapper can't assume), do not force it in, but do not silently drop it either: document its existence and how to run it separately, in both the generated script's own header/doc-comment and the `.github/copilot-instructions.md` guidance you already write.
- Each script must:
  - Be silent during execution.
  - Return a single clear success message on success (for example: `Build successful`, `Startup successful`, `X Tests successful`, `Dependencies successful`).
  - Return full command output on failure.

Suggested scripts
-----------------

- `scripts/run_build.<ext>` — build/compile the project (use repo-recommended commands, e.g., `dotnet build`).
- `scripts/run_start.<ext>` — build and start the application plus required services (e.g., `docker-compose up --build`), avoiding long seeding tasks.
  - this command should also start dependencies, for example database if needed.
- `scripts/run_tests.<ext>` — run tests; accept an optional filter argument to run a subset.
- `scripts/run_linters.<ext>` — run linters; formatters; static analysis tools as applicable.
- `scripts/run_installpackages.<ext>` — install dependencies (frontend and / or backend).
- Additional scripts for other common tasks as relevant to the repository (for example, `run_db_migrate.<ext>`).

Guidelines
----------

- Keep scripts idempotent and safe to run repeatedly.
- Document assumptions and required tools and frameworks in each script header.
- Ensure failures surface the full command output for debugging.

Repository instruction
----------------------

- Add or update `.github/copilot-instructions.md` with guidance for the next agents on using these scripts, referencing only the script paths actually generated (never a path for a task that was skipped), with the actual extension for this project. For example (PowerShell shown; substitute the actual format's extension, invocation, and only the tasks actually generated):

```
# Verify

**Always** use scripts/run_build.<ext> to build the project.
**Always** use scripts/run_tests.<ext> (with optional filter parameter) to verify your changes.
```

- If every task was skipped for lack of a plausibly-matching source (the all-skip case), add this note to `.github/copilot-instructions.md` in place of the 'Verify' guidance above: "No run scripts could be generated automatically; run init interactively, or add scripts/run_*.<ext> manually." Also write `[TargetFolder]/.agentic/run-script-result.json` containing exactly `{"result":"no-run-scripts"}` so init can recognize the completed no-output result on resume.

Acceptance criteria
-------------------

- The repository contains `scripts/` with the requested run scripts, in the requested format, for every task that had a plausibly-matching, non-placeholder source (an npm script for npm-scripts, or the equivalent repo-inspected command for shell/batch/powershell).
- `.github/copilot-instructions.md` includes the 'Verify' guidance above naming only the scripts actually generated, or, in the all-skip case, the fallback note instead.