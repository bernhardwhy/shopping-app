const { spawn } = require("child_process");
const { createWriteStream, readFileSync, unlinkSync } = require("fs");
const os = require("os");
const path = require("path");

module.exports = function runNpmScript(args, successMessage) {
  const projectRoot = path.resolve(__dirname, "..");
  const logPath = path.join(
    os.tmpdir(),
    `shopping-app-${process.pid}-${Date.now()}.log`
  );
  const log = createWriteStream(logPath);
  const command = process.platform === "win32" ? "npm.cmd" : "npm";
  const child = spawn(command, args, {
    cwd: projectRoot,
    env: process.env,
    shell: process.platform === "win32",
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"]
  });
  let launchError;

  child.stdout.pipe(log, { end: false });
  child.stderr.pipe(log, { end: false });
  child.on("error", error => {
    launchError = error;
  });
  child.on("close", code => {
    log.end(() => {
      let output = "";
      try {
        output = readFileSync(logPath, "utf8");
      } finally {
        unlinkSync(logPath);
      }

      if (launchError || code !== 0) {
        if (output) process.stderr.write(output);
        if (launchError) process.stderr.write(`${launchError.message}\n`);
        process.exitCode = code || 1;
        return;
      }

      process.stdout.write(`${successMessage}\n`);
    });
  });
};
