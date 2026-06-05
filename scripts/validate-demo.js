#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

const requiredFiles = [
  "web-demo/index.html",
  "web-demo/demo-report.html",
  "web-demo/styles.css",
  "examples/sample-report-data.json",
  "docs/compliance.md",
  "docs/monetization.md",
  "docs/roadmap.md",
];

const requiredJsonKeys = [
  "projectName",
  "videoTitle",
  "duration",
  "sourceType",
  "summary",
  "keyMoments",
  "tags",
  "strengths",
  "improvements",
  "exportedAt",
];

function read(relativePath) {
  const file = path.join(root, relativePath);
  if (!fs.existsSync(file)) throw new Error(`Missing required file: ${relativePath}`);
  return fs.readFileSync(file, "utf8");
}

function assertIncludes(text, needle, file) {
  if (!text.includes(needle)) {
    throw new Error(`${file} does not include required text: ${needle}`);
  }
}

function main() {
  for (const file of requiredFiles) read(file);

  const index = read("web-demo/index.html");
  const report = read("web-demo/demo-report.html");
  const compliance = read("docs/compliance.md");
  const data = JSON.parse(read("examples/sample-report-data.json"));

  assertIncludes(index, "creator-owned", "web-demo/index.html");
  assertIncludes(index, "authorized", "web-demo/index.html");
  assertIncludes(index, "your-email@example.com", "web-demo/index.html");
  assertIncludes(report, "Sample report only", "web-demo/demo-report.html");
  assertIncludes(report, "fictional", "web-demo/demo-report.html");
  assertIncludes(compliance, "Prohibited Use", "docs/compliance.md");

  for (const key of requiredJsonKeys) {
    if (!(key in data)) throw new Error(`examples/sample-report-data.json missing key: ${key}`);
  }

  if (data.sourceType !== "creator-owned sample") {
    throw new Error("Sample report data must stay fictional and creator-owned.");
  }

  console.log("Demo validation passed.");
}

try {
  main();
} catch (error) {
  console.error(error.message || error);
  process.exit(1);
}
