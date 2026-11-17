# AE Setup Next Steps

After completing the user's actual request, run `node .github/harness/scripts/Test-AeSetupNextSteps.js` from the current working directory.
If it exits with `1`, append exactly `❗ AE Setup Next Steps ([AE_SETUP_NEXT_STEPS.md](./AE_SETUP_NEXT_STEPS.md)) still needs to be completed.` to the response.
If it exits with `0`, append exactly `✅ AE Setup Next Steps ([AE_SETUP_NEXT_STEPS.md](./AE_SETUP_NEXT_STEPS.md)) has been completed. Please remove the section \`# AE Setup Next Steps\` from the \`copilot-instructions.md\` and delete the \`AE_SETUP_NEXT_STEPS.md\` file.` to the response.
This reminder is advisory and must never block, defer, or replace the requested work.

# Project specific instructions

Have we learned anything specific about this project that we should always follow when working on it? Document those details briefly here for all AI agents to see and follow.


# Verify

**Always** use `scripts/run_build.js` to build the project.
**Always** use `scripts/run_tests.js` to run tests; pass an optional test file path to limit the run.
Use `scripts/run_start.js` to start the development server. It stays running until stopped.
Use `scripts/run_installpackages.js` to install project dependencies.
