var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../.github/harness/scripts/update-health-badge.ts
var fs = __toESM(require("fs"));
var path2 = __toESM(require("path"));

// src/security-utils.ts
var path = __toESM(require("path"));
function validatePathContainment(childPath, parentPath) {
  const normalizedChild = path.resolve(childPath);
  const normalizedParent = path.resolve(parentPath);
  return normalizedChild.startsWith(normalizedParent + path.sep) || normalizedChild === normalizedParent;
}
function safeJoin(parentPath, ...segments) {
  const joined = path.join(parentPath, ...segments);
  if (!validatePathContainment(joined, parentPath)) {
    throw new Error(`Path traversal detected: ${segments.join("/")}`);
  }
  return joined;
}

// ../.github/harness/scripts/update-health-badge.ts
function readLines(content) {
  const lines = content.split(/\r\n|\n/);
  if (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop();
  }
  return lines;
}
function getUpdatedReadmeLines(lines, badgeMarkdown) {
  const result = [...lines];
  for (let i = 0; i < lines.length; i++) {
    if (/\[!\[Harness\]/.test(lines[i])) {
      result.splice(i + 1, 0, badgeMarkdown);
      return result;
    }
  }
  const topBadgeIndexes = [];
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    if (/\[!\[/.test(lines[i])) {
      topBadgeIndexes.push(i);
    }
  }
  if (topBadgeIndexes.length > 0) {
    let lastBadgeIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (/\[!\[/.test(lines[i])) {
        lastBadgeIndex = i;
      }
    }
    result.splice(lastBadgeIndex + 1, 0, badgeMarkdown);
    return result;
  }
  if (lines.length === 0) {
    return [badgeMarkdown];
  }
  result.splice(1, 0, "");
  result.splice(2, 0, badgeMarkdown);
  return result;
}
function main() {
  const projectDirArg = process.argv[2] || ".";
  const snapshotFileArg = process.argv[3] || "";
  const projectRoot = path2.resolve(projectDirArg);
  const readmeFile = safeJoin(projectRoot, "README.md");
  if (!fs.existsSync(readmeFile)) {
    console.log("[harness-health] No README.md found - skipping badge update");
    return;
  }
  let healthStatus = "Healthy";
  let healthColour = "2E8B57";
  let resolvedSnapshotFile = "";
  if (snapshotFileArg) {
    resolvedSnapshotFile = path2.isAbsolute(snapshotFileArg) ? snapshotFileArg : safeJoin(projectRoot, snapshotFileArg);
  }
  if (resolvedSnapshotFile && fs.existsSync(resolvedSnapshotFile) && fs.statSync(resolvedSnapshotFile).isFile()) {
    const snapshotContent = readLines(fs.readFileSync(resolvedSnapshotFile, "utf-8"));
    let metaStartIndex = -1;
    let metaEndIndex = snapshotContent.length;
    for (let i = 0; i < snapshotContent.length; i++) {
      if (snapshotContent[i] === "## Meta") {
        metaStartIndex = i + 1;
        continue;
      }
      if (metaStartIndex >= 0 && /^## /.test(snapshotContent[i])) {
        metaEndIndex = i;
        break;
      }
    }
    const metaSection = metaStartIndex >= 0 ? snapshotContent.slice(metaStartIndex, Math.min(metaEndIndex, metaStartIndex + 20)) : [];
    let attentionSignals = 0;
    if (metaSection.some((line) => /overdue/i.test(line))) {
      attentionSignals++;
    }
    if (metaSection.some((line) => /stalled/i.test(line))) {
      attentionSignals++;
    }
    if (metaSection.some((line) => /silent/i.test(line))) {
      attentionSignals++;
    }
    if (metaSection.some((line) => /alert|declining/i.test(line))) {
      attentionSignals++;
    }
    if (attentionSignals >= 2) {
      healthStatus = "Degraded";
      healthColour = "DC143C";
    } else if (attentionSignals >= 1) {
      healthStatus = "Attention";
      healthColour = "DAA520";
    }
    const enforcedLine = snapshotContent.find((line) => /^- Constraints:/.test(line));
    if (enforcedLine) {
      const pctMatch = /(\d+)%/.exec(enforcedLine);
      if (pctMatch && parseInt(pctMatch[1], 10) < 70) {
        healthStatus = "Degraded";
        healthColour = "DC143C";
      }
    }
  } else {
    const snapshotDir = safeJoin(projectRoot, "observability", "snapshots");
    const snapshotExists = fs.existsSync(snapshotDir) && fs.statSync(snapshotDir).isDirectory() && fs.readdirSync(snapshotDir).length > 0;
    if (!snapshotExists) {
      healthStatus = "Degraded";
      healthColour = "DC143C";
    }
  }
  const encodedStatus = healthStatus.replace(/ /g, "%20");
  const badgeUrl = `https://img.shields.io/badge/Harness_Health-${encodedStatus}-${healthColour}?style=flat-square`;
  const linkTarget = snapshotFileArg || "observability/snapshots/";
  const badgeMarkdown = `[![Harness Health](${badgeUrl})](${linkTarget})`;
  const readmeContent = fs.readFileSync(readmeFile, "utf-8");
  const badgePattern = /\[!\[Harness Health\]\([^\r\n]*?\)\]\([^\r\n]*?\)/;
  if (badgePattern.test(readmeContent)) {
    const updatedContent = readmeContent.replace(badgePattern, badgeMarkdown);
    fs.writeFileSync(readmeFile, updatedContent, "utf-8");
    console.log(`[harness-health] Badge updated: ${healthStatus}`);
    return;
  }
  const readmeLines = readLines(readmeContent);
  const newLines = getUpdatedReadmeLines(readmeLines, badgeMarkdown);
  fs.writeFileSync(readmeFile, newLines.join("\n") + "\n", "utf-8");
  console.log(`[harness-health] Badge inserted: ${healthStatus}`);
}
main();
