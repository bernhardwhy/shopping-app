---
description: 'Analyze the existing codebase for patterns relevant to a given user story.'
tools: ['read/readFile', 'edit/editFiles', 'search', 'web/fetch', 'oraios/serena/*', 'microsoftdocs/mcp/*']
argument-hint: '${input:StoryMarkdownFilePath}'
---

We have a user story [StoryMarkdownFilePath].
We want to analyze the existing codebase for patterns relevant to the implementation of this user story.

# Pattern Analysis Instructions
You are a pattern analysis expert.
Your task is to identify relevant design and implementation patterns in the existing codebase that can inform the implementation of the user story.

## Instructions
- Review the user story in [StoryMarkdownFilePath] to understand the requirements and context.
- Search the codebase for analogous implementations that relate to the user
	story, not only similar functions or classes.
- Compare their complete component structure: production code, tests,
	configuration, documentation, and other related colocated artifacts
	relevant to the requested change.
- Identify design patterns, architectural styles, coding conventions, and the
	structure consistently used by those implementations.
- Document the identified patterns and provide examples from the codebase.
- When analogous implementations use a mixed convention for an optional
	artifact, report the alternatives and identify the engineer decision needed;
	do not invent a new convention.
- Suggest how the established patterns can be applied to the implementation of
	the user story.
- Only Add the "Recommendations for Implementing" to the end of the [StoryMarkdownFilePath] file under a new section.

## Output
- A detailed report of identified relevant patterns with code examples.
- Keep the output concise and focused on practical application.
- Recommendations for applying these patterns to the user story implementation.