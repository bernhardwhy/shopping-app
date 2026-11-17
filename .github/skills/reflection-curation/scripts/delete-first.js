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

// ../.github/skills/reflection-curation/scripts/delete-first.ts
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

// ../.github/skills/reflection-curation/scripts/delete-first.ts
var repositoryRoot = path2.resolve(__dirname, "..", "..", "..", "..");
var logPath = safeJoin(repositoryRoot, "REFLECTION_LOG.md");
if (!fs.existsSync(logPath)) {
  console.error(`Reflection log not found: ${logPath}`);
  process.exit(1);
}
var content = fs.readFileSync(logPath, "utf-8");
var match = /^---\r?\n[\s\S]*?(?=^---\r?$|(?![\s\S]))/m.exec(content);
if (!match) {
  console.error(`No reflection block found in: ${logPath}`);
  process.exit(1);
}
var remainingContent = content.slice(0, match.index) + content.slice(match.index + match[0].length);
fs.writeFileSync(logPath, remainingContent, "utf-8");
console.log("Reflection deleted successfully.");
