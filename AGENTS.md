# AGENTS.md

## User Input

If you need input from the user, start the message with ❓

## Caveman Mode

Write terse. Keep technical substance. Cut fluff.

- Drop filler, pleasantries, and hedging
- Fragments OK
- Use short exact words
- Keep technical terms and code blocks exact
- Quote errors exactly
- Prefer: `[thing] [action] [reason]. [next step].`

Use normal style for security warnings, irreversible actions, ambiguity, multi-step clarification, or when the user asks for it. Resume caveman after.

Code, commits, and PRs stay normal. `stop caveman` or `normal mode` disables this mode.

## Core Rules

- Analyze existing patterns before implementing
- Match named reference behavior: compare ownership and timing, then validate equivalence
- Consider security on every change
- Validate changes before handing back
- Stop after logical units; let the developer handle commits
- Never provide effort or time estimates

## Code Standards

- Follow language and project conventions
- Use intention-revealing names, small focused functions, and clear boundaries
- Prefer SOLID, dependency injection, and low coupling
- Use domain language consistently
- Comment only for non-obvious logic or decisions; explain why, not what
- Replace old solutions instead of adding deprecation layers unless asked
- No direct `print` or `console.*`; use the approved structured logger
- Use CSS classes, not inline styles
- Write explicit parameter types
- Avoid god objects, magic numbers, copy-paste, and deep nesting
- Write Tests first

## Tests

- Add automated tests for new functionality
- Do not mock the class under test; mock dependencies only
- Work in small red-green-refactor steps when practical
- Use descriptive outcome-based test names
- Make assertions match the test name and prefer concrete expected values
- Organize tests from happy path to edge and error cases

### Test Writing Guidelines

- **Name the behavior and result**: Use formats like "returns X when Y" or "throws error when Z".
  - ✅ GOOD: "returns chunks without error when text contains newlines"
  - ❌ BAD: "handles newline characters"
- **Match assertions to the title**: Verify exactly what the name promises.
  - ❌ BAD: "creates objects with different IDs" but only checks the count/length
  - ✅ GOOD: "creates objects with different IDs" and actually verifies the IDs differ
  - ❌ BAD: "applies correct transformation" but only checks the result is truthy
  - ✅ GOOD: "applies correct transformation" and checks the actual transformed values
- **Prefer concrete values over shape checks**: Expect exact outputs, not vague conditions.
  - ✅ GOOD: `assert result.chunks equals ['First.', ' Second.']`
  - ❌ BAD: `assert result.chunks.length > 1`
  - ✅ GOOD: `assert result equals {chunks: ['text'], context: {line: 10}, properties: {}, error: null}`
  - ❌ BAD: `assert result has property 'chunks'`
- **One concept per test**: Test one clear idea at a time.
- **Prefer full comparisons**: Use complete expected values unless key properties or substrings are clearer.
- **Order tests clearly**: Group related tests, then go happy path, edge cases, error cases.

## Security And Compliance

- Validate inputs and sanitize outputs at boundaries
- Use parameterized queries, auth, and authorization where relevant
- Protect data in transit and at rest
- Apply least privilege, zero trust, secrets management, and dependency audits
- Minimize data collection and avoid logging sensitive data
- Log PII access when applicable with user, action, time, and affected data
- Follow OWASP and use European regions for data processing when relevant

## AI Agent Behavior

- Use the implementation plan agent: `.github/agents/implementation-plan.agent.md`
- Before using an MCP, read `.github/mcp-instructions.md`.
- Use comments only for complex business logic or non-obvious choices
- Document architectural decisions using ADR format with context and rationale
- Do not provide timeline estimates

## Done Checklist

- [ ] Security applied
- [ ] Tests added and passing
- [ ] GDPR/compliance checked
- [ ] Docs updated if needed
- [ ] Code quality validated
