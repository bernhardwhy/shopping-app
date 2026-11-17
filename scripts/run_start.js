const { spawn } = require("child_process");
const { createWriteStream, readFileSync, unlinkSync } = require("fs");
const os = require("os");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const logPath = path.join(
  os.tmpdir(),
  `shopping-app-start-${process.pid}-${Date.now()}.log`
);
const log = createWriteStream(logPath);
const isWindows = process.platform === "win32";
const child = spawn(isWindows ? "npm.cmd" : "npm", ["start"], {
  cwd: projectRoot,
  env: { ...process.env, BROWSER: "none" },
  shell: isWindows,
  windowsHide: true,
  stdio: ["ignore", "pipe", "pipe"]
});

let ready = false;
let failedToCompile = false;
let stopping = false;
let launchError;
let outputTail = "";

function capture(chunk) {
  log.write(chunk);
  outputTail = (outputTail + chunk.toString()).slice(-4096);

  if (!ready && /Failed to compile/i.test(outputTail)) {
    failedToCompile = true;
    child.kill();
  } else if (!ready && /Compiled successfully!?/i.test(outputTail)) {
    ready = true;
    process.stdout.write("Startup successful\n");
  }
}

child.stdout.on("data", capture);
child.stderr.on("data", capture);
child.on("error", error => {
  launchError = error;
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    stopping = true;
    child.kill(signal);
  });
}

child.on("close", code => {
  log.end(() => {
    let output = "";
    try {
      output = readFileSync(logPath, "utf8");
    } finally {
      unlinkSync(logPath);
    }

    if (stopping) return;
    if (!ready || failedToCompile || launchError || code !== 0) {
      if (output) process.stderr.write(output);
      if (launchError) process.stderr.write(`${launchError.message}\n`);
      process.exitCode = code || 1;
    }
  });
});
