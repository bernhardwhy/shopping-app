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

// ../.github/harness/scripts/Test-AeSetupNextSteps.ts
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));
var projectRoot = path.resolve(__dirname, "..", "..", "..");
var nextStepsPath = path.join(projectRoot, "AE_SETUP_NEXT_STEPS.md");
if (fs.existsSync(nextStepsPath) && fs.statSync(nextStepsPath).isFile()) {
  const content = fs.readFileSync(nextStepsPath, "utf-8");
  if (/\[ \]|\[\]/.test(content)) {
    console.log("AE_SETUP_NEXT_STEPS_PENDING");
    process.exit(1);
  }
}
console.log("AE_SETUP_NEXT_STEPS_COMPLETE");
process.exit(0);
