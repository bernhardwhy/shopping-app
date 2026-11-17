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

// ../.github/harness/scripts/update-badge.ts
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

// ../.github/harness/scripts/update-badge.ts
function readLines(content) {
  const lines = content.split(/\r\n|\n/);
  if (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop();
  }
  return lines;
}
function getUpdatedReadmeLines(lines, badgeMarkdown) {
  if (lines.length === 0) {
    return [badgeMarkdown];
  }
  const topBadgeIndexes = [];
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    if (/\[!\[/.test(lines[i])) {
      topBadgeIndexes.push(i);
    }
  }
  const result = [...lines];
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
  result.splice(1, 0, "");
  result.splice(2, 0, badgeMarkdown);
  return result;
}
function main() {
  const projectDirArg = process.argv[2] || ".";
  const projectRoot = path2.resolve(projectDirArg);
  const harnessFile = safeJoin(projectRoot, "HARNESS.md");
  const readmeFile = safeJoin(projectRoot, "README.md");
  if (!fs.existsSync(harnessFile)) {
    console.log("[harness] No HARNESS.md found - skipping badge update");
    return;
  }
  if (!fs.existsSync(readmeFile)) {
    console.log("[harness] No README.md found - skipping badge update");
    return;
  }
  const harnessContent = readLines(fs.readFileSync(harnessFile, "utf-8"));
  const enforcedLine = harnessContent.find((line) => /^Constraints enforced:/.test(line));
  if (!enforcedLine) {
    console.log("[harness] No enforcement ratio found in HARNESS.md Status section");
    return;
  }
  const ratio = enforcedLine.replace(/^Constraints enforced:\s*/, "").replace(/\s/g, "");
  const ratioMatch = /^(\d+)\/(\d+)$/.exec(ratio);
  if (!ratioMatch) {
    console.log("[harness] Invalid enforcement ratio in HARNESS.md Status section");
    return;
  }
  const numerator = parseInt(ratioMatch[1], 10);
  const denominator = parseInt(ratioMatch[2], 10);
  const pct = denominator === 0 ? 0 : Math.trunc(numerator * 100 / denominator);
  const colour = pct === 100 ? "2E8B57" : pct >= 50 ? "4682B4" : pct >= 1 ? "DAA520" : "808080";
  const driftLine = harnessContent.find((line) => /^Drift detected:/.test(line));
  const driftSuffix = driftLine && /yes/i.test(driftLine) ? "%20%E2%9A%A0%20drift" : "";
  const encodedRatio = `${numerator}/${denominator}`.replace("/", "%2F");
  const badgeText = `${encodedRatio}_enforced${driftSuffix}`;
  const badgeUrl = `https://img.shields.io/badge/Harness-${badgeText}-${colour}?style=flat-square`;
  const badgeMarkdown = `[![Harness](${badgeUrl})](HARNESS.md)`;
  const readmeContent = fs.readFileSync(readmeFile, "utf-8");
  const badgePattern = /\[!\[Harness\]\([^\r\n]*?\)\]\([^\r\n]*?\)/;
  if (badgePattern.test(readmeContent)) {
    const updatedContent = readmeContent.replace(badgePattern, badgeMarkdown);
    fs.writeFileSync(readmeFile, updatedContent, "utf-8");
    console.log(`[harness] Badge updated: ${numerator}/${denominator} enforced`);
    return;
  }
  const readmeLines = readLines(readmeContent);
  const newLines = getUpdatedReadmeLines(readmeLines, badgeMarkdown);
  fs.writeFileSync(readmeFile, newLines.join("\n") + "\n", "utf-8");
  console.log(`[harness] Badge inserted: ${numerator}/${denominator} enforced`);
}
main();
