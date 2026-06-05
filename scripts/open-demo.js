#!/usr/bin/env node
"use strict";

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

function usage() {
  console.log(`Usage:
  node scripts/open-demo.js [options]

Options:
  --report   Open only web-demo/demo-report.html
  --index    Open only web-demo/index.html
  --print    Print file URLs without opening a browser
  --help     Show this help
`);
}

function parseArgs(argv) {
  const args = { report: false, index: false, print: false, help: false };
  for (const item of argv) {
    if (item === "--report") args.report = true;
    else if (item === "--index") args.index = true;
    else if (item === "--print") args.print = true;
    else if (item === "--help" || item === "-h") args.help = true;
    else throw new Error(`Unexpected argument: ${item}`);
  }
  return args;
}

function openerCommand(url) {
  if (process.platform === "win32") {
    return { command: "cmd", args: ["/c", "start", "", url] };
  }
  if (process.platform === "darwin") {
    return { command: "open", args: [url] };
  }
  return { command: "xdg-open", args: [url] };
}

function openUrl(url) {
  const { command, args } = openerCommand(url);
  const child = spawn(command, args, {
    detached: true,
    stdio: "ignore",
  });
  child.unref();
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }

  const root = path.resolve(__dirname, "..");
  const pages = [];
  if (!args.report) pages.push(path.join(root, "web-demo", "index.html"));
  if (!args.index) pages.push(path.join(root, "web-demo", "demo-report.html"));

  for (const file of pages) {
    if (!fs.existsSync(file)) {
      throw new Error(`Demo file not found: ${file}`);
    }
  }

  const urls = pages.map((file) => pathToFileURL(file).href);
  if (args.print) {
    console.log(urls.join("\n"));
    return;
  }

  for (const url of urls) openUrl(url);
  console.log(`Opened ${urls.length} demo page(s).`);
}

try {
  main();
} catch (error) {
  console.error(error.message || error);
  process.exit(1);
}
