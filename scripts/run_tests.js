const runNpmScript = require("./run-npm-script");

const filters = process.argv.slice(2);
if (filters.length > 1 || (filters[0] && !/^[A-Za-z0-9_./\\-]+$/.test(filters[0]))) {
  console.error("Usage: node scripts/run_tests.js [test-file-path]");
  process.exit(2);
}

const args = ["test", "--", "--watchAll=false"];
if (filters[0]) args.push(filters[0]);

runNpmScript(args, filters[0] ? `Tests successful (${filters[0]})` : "Tests successful");
