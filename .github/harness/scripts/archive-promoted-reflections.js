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

// ../.github/harness/scripts/archive-promoted-reflections.ts
var fs = __toESM(require("fs"));

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

// ../.github/harness/scripts/archive-promoted-reflections.ts
function readLines(content) {
  const lines = content.split(/\r\n|\n/);
  if (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop();
  }
  return lines;
}
function getEntryField(entryLines, fieldName) {
  const escapedFieldName = fieldName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`^- \\*\\*${escapedFieldName}\\*\\*: (.+)$`);
  for (const line of entryLines) {
    const match = pattern.exec(line);
    if (match) {
      return match[1];
    }
  }
  return "";
}
function getPromotedRhs(entryLines) {
  const pattern = /^- \*\*Promoted\*\*: \d{4}-\d{2}-\d{2} → (.+)$/;
  for (const line of entryLines) {
    const match = pattern.exec(line);
    if (match) {
      return match[1].replace(/\s+$/, "");
    }
  }
  return "";
}
function testPromotedRhs(rhs) {
  if (!rhs || !rhs.trim()) {
    return false;
  }
  const agentsMatch = /^AGENTS\.md.*"(.+)"/.exec(rhs);
  if (agentsMatch) {
    const needle = agentsMatch[1];
    const agentsPath = safeJoin(process.cwd(), "AGENTS.md");
    return fs.existsSync(agentsPath) && fs.readFileSync(agentsPath, "utf-8").includes(needle);
  }
  const harnessMatch = /^HARNESS\.md:\s*(.+)$/.exec(rhs);
  if (harnessMatch) {
    const needle = `### ${harnessMatch[1]}`;
    const harnessPath = safeJoin(process.cwd(), "HARNESS.md");
    return fs.existsSync(harnessPath) && fs.readFileSync(harnessPath, "utf-8").includes(needle);
  }
  return /^(aged-out|"?no promotion"?|superseded by )/.test(rhs);
}
function getReflectionEntries(logPath) {
  const lines = readLines(fs.readFileSync(logPath, "utf-8"));
  const entries = [];
  let current = [];
  let inEntry = false;
  for (const line of lines) {
    if (line === "---") {
      if (inEntry && current.length > 0) {
        entries.push(current);
      }
      current = [];
      inEntry = true;
      continue;
    }
    if (!inEntry && line.startsWith("# ")) {
      continue;
    }
    if (inEntry) {
      current.push(line);
    }
  }
  if (inEntry && current.length > 0) {
    entries.push(current);
  }
  return entries;
}
function formatDate(date) {
  return date.toISOString().slice(0, 10);
}
function main() {
  const dryRun = process.argv.includes("--dry-run");
  const cwd = process.cwd();
  const logPath = safeJoin(cwd, "REFLECTION_LOG.md");
  const archiveDir = safeJoin(cwd, "reflections", "archive");
  const today = formatDate(/* @__PURE__ */ new Date());
  if (!fs.existsSync(logPath)) {
    process.stderr.write(`No REFLECTION_LOG.md in ${cwd}; nothing to do.
`);
    return;
  }
  const toArchive = [];
  const toKeep = [];
  for (const entry of getReflectionEntries(logPath)) {
    const rhs = getPromotedRhs(entry);
    if (!rhs || !rhs.trim()) {
      toKeep.push(entry);
      continue;
    }
    if (testPromotedRhs(rhs)) {
      toArchive.push(entry);
    } else {
      const date = getEntryField(entry, "Date");
      process.stderr.write(`WARN: Promoted line did not verify; skipping entry dated ${date}
`);
      toKeep.push(entry);
    }
  }
  if (toArchive.length === 0) {
    console.log("No promoted entries to archive.");
    return;
  }
  if (dryRun) {
    console.log(`Would archive ${toArchive.length} entries (dry run).`);
    return;
  }
  fs.mkdirSync(archiveDir, { recursive: true });
  for (const entry of toArchive) {
    const date = getEntryField(entry, "Date");
    const yearMatch = /^(\d{4})-/.exec(date);
    const year = yearMatch ? yearMatch[1] : String((/* @__PURE__ */ new Date()).getFullYear());
    const archivePath = safeJoin(archiveDir, `${year}.md`);
    if (!fs.existsSync(archivePath)) {
      const header = [
        `# Reflection Archive \u2014 ${year}`,
        "",
        "Entries archived from `REFLECTION_LOG.md` after promotion.",
        ""
      ];
      fs.writeFileSync(archivePath, header.join("\n") + "\n", "utf-8");
    }
    const archiveBlock = ["---", "", ...entry, `- **Archived**: ${today} (auto, Path 1)`, ""];
    fs.appendFileSync(archivePath, archiveBlock.join("\n") + "\n", "utf-8");
  }
  const newLog = ["# Reflection Log", ""];
  for (const entry of toKeep) {
    newLog.push("---", "", ...entry, "");
  }
  fs.writeFileSync(logPath, newLog.join("\n") + "\n", "utf-8");
  console.log(`Archived ${toArchive.length} entries; ${toKeep.length} entries remain in REFLECTION_LOG.md.`);
}
main();
