---
name: sdlc-specify-taskplanning
description: Review a local Markdown User Story and its task-list file, align tasks to the story's actual scope and acceptance criteria, and add concise project-grounded task guidance. Use when the user asks to inspect, clean up, add, remove, or rewrite tasks for an existing local User Story without creating a full implementation plan.
argument-hint: "<User Story Markdown file path>"
---

# Local User Story Task Planning

Align the tasks for an existing local User Story to its real scope. This skill uses local Markdown artifacts only.

## Use this skill when

- The user asks to review the local tasks of a Markdown User Story and make them match the story.
- The request mentions adding, removing, changing, or cleaning up tasks for an existing local User Story.
- Task descriptions should become more useful for implementation in the current project, while remaining concise guidelines.
- The story already exists and the main problem is task alignment rather than story authoring.

## Do not use this skill when

- The user needs a new story, missing requirements, or unclear acceptance criteria defined from scratch; use [sdlc-specify](../sdlc-specify/SKILL.md).
- The user only wants a single trivial task edit.
- The user wants a full implementation plan with phased delivery detail rather than concise execution guidance.

## Inputs

- Path to the User Story Markdown file under `_wiki/UserStories/`.
- Optional constraints on task wording, granularity, or whether updates should be applied directly or drafted first.
- Current repository context so task guidance can refer to real files, modules, tests, prompts, skills, docs, or workflows.

## Local Artifacts

- Treat the supplied story Markdown file as the source of truth for scope, acceptance criteria, refinement notes, and exclusions.
- Derive the one task-list file as `_wiki/Tasks/<story-file-name>`, using the exact filename of the supplied story. For example, `_wiki/UserStories/US00X_Kurzbezeichnung.md` maps to `_wiki/Tasks/US00X_Kurzbezeichnung.md`.
- Treat that one task-list Markdown file as the task record. Preserve its established local structure and metadata when editing it.
- Create the task-list file at the derived path when it does not exist.
- Remove out-of-scope task entries from the task list. Do not delete the task-list file unless the user explicitly asks for deletion.

## Steps

1. Resolve the local story and task list.
   - Read the User Story, including scope, acceptance criteria, refinement notes, and exclusions.
   - Derive and read `_wiki/Tasks/<story-file-name>` when it exists; otherwise record that the task list will be created.
2. Compare the tasks to the story.
   - Separate tasks into four buckets: keep, update, remove, and create.
   - Identify duplicate, out-of-scope, or missing coverage against explicit story requirements.
3. Ground the task plan in the project.
   - Inspect the nearest owning code, tests, prompts, skills, docs, or workflow files that each task would actually touch.
   - Use those concrete repository anchors to make each task implementation-friendly.
   - Keep task guidance short and practical; it is not a design document or implementation plan.
4. Draft the task delta before mutation unless the user clearly requested direct changes.
   - Show which tasks will stay, be rewritten, be added, or be removed.
   - Explain proposed removals briefly in terms of story scope.
   - Identify the task-list file that would change.
   - If the user did not clearly authorize changes, stop for confirmation.
5. Apply the smallest safe set of changes.
   - Update the title and concise guidance of retained tasks where needed.
   - Add missing tasks to the task-list file.
   - Remove out-of-scope task entries while retaining the task-list file unless deletion was explicitly requested.
6. Verify the final task set.
   - Re-read the User Story and `_wiki/Tasks/<story-file-name>` to confirm the intended task set and content.
   - Report any remaining scope ambiguity.

## Task Guidance Standard

- Prefer references to real implementation surfaces such as repository paths, tests, prompts, agents, skills, or workflow steps.
- State what to inspect or change, where it likely lives, and the outcome that matters.
- Keep descriptions concise guidelines, not long plans, architectural essays, or speculative redesigns.

## Output

- The resolved local story and task-list paths.
- A proposed task delta: keep, update, remove, create.
- Concise, project-grounded task titles and guidance aligned to the story scope.
- On confirmation or explicit direct-edit request, the local task-list updates applied and verified.
- The final task set and any unresolved scope questions or deletion limitations.

## Validation

- Every task in the task-list file maps to real story scope or acceptance criteria.
- Out-of-scope tasks are removed from the task-list file.
- New and updated task descriptions are concise guidelines rather than full implementation plans.
- Task descriptions are grounded in the current project instead of generic backlog wording.
- Destructive removal defaults to removing a task entry, not deleting the task-list file, unless the user explicitly requests deletion.
- The story and task-list file are re-read and verified after mutation.

## Handoff

- State which tasks were kept, changed, added, and removed.
- State whether the task-list file was retained rather than deleted because deletion was not authorized.
- Call out any remaining scope ambiguity in the story itself.
- Suggest the next follow-up only when one naturally remains, such as refining the story text or merging duplicated tasks.
- If the user has not confirmed mutation, end with `❓STOP`.
