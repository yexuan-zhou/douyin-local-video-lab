#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const DEFAULT_IGNORE_DIRS = new Set([
  ".git",
  "node_modules",
  "downloads",
  "artifacts",
  "work",
  "browser-profile",
  "edge-profile",
]);

const DEFAULT_IGNORE_EXTS = new Set([
  ".mp4",
  ".mov",
  ".m4v",
  ".webm",
  ".m3u8",
  ".mpd",
]);

function usage() {
  console.log(`Usage:
  GITHUB_TOKEN=<token> node scripts/github-upload.js <repo-name> [options]

Options:
  --owner <user>          GitHub owner. Default: authenticated user
  --dir <path>            Project directory. Default: current directory
  --private               Create a private repository
  --description <text>    Repository description
  --branch <name>         Branch name. Default: main
  --help                  Show this help

The token needs permission to create repositories and write repository contents.
Use a short-lived fine-grained token when possible.
`);
}

function parseArgs(argv) {
  const args = {
    repo: null,
    owner: null,
    dir: process.cwd(),
    private: false,
    description: "Download public short-video links for local archiving, sample frames, and summarize video content offline.",
    branch: "main",
  };

  for (let i = 0; i < argv.length; i++) {
    const item = argv[i];
    if (item === "--help" || item === "-h") args.help = true;
    else if (item === "--owner") args.owner = argv[++i];
    else if (item === "--dir") args.dir = argv[++i];
    else if (item === "--private") args.private = true;
    else if (item === "--description") args.description = argv[++i];
    else if (item === "--branch") args.branch = argv[++i];
    else if (!args.repo) args.repo = item;
    else throw new Error(`Unexpected argument: ${item}`);
  }

  return args;
}

async function github(token, method, endpoint, body) {
  const response = await fetch(`https://api.github.com${endpoint}`, {
    method,
    headers: {
      "authorization": `Bearer ${token}`,
      "accept": "application/vnd.github+json",
      "content-type": "application/json",
      "x-github-api-version": "2022-11-28",
      "user-agent": "douyin-local-video-lab-uploader",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { message: text };
  }

  if (!response.ok) {
    const message = json?.message || `HTTP ${response.status}`;
    throw new Error(`${method} ${endpoint} failed: ${message}`);
  }

  return json;
}

function shouldIgnore(file) {
  const parts = file.split(path.sep);
  if (parts.some((part) => DEFAULT_IGNORE_DIRS.has(part))) return true;
  const ext = path.extname(file).toLowerCase();
  if (DEFAULT_IGNORE_EXTS.has(ext)) return true;
  return false;
}

function collectFiles(root) {
  const result = [];

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      const rel = path.relative(root, full);
      if (shouldIgnore(rel)) continue;

      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile()) {
        result.push({ full, rel: rel.replace(/\\/g, "/") });
      }
    }
  }

  walk(root);
  return result.sort((a, b) => a.rel.localeCompare(b.rel));
}

function isBinary(buffer) {
  const length = Math.min(buffer.length, 8000);
  for (let i = 0; i < length; i++) {
    if (buffer[i] === 0) return true;
  }
  return false;
}

async function ensureRepo(token, owner, repo, options) {
  if (owner) {
    try {
      return await github(token, "GET", `/repos/${owner}/${repo}`);
    } catch {
      return github(token, "POST", `/orgs/${owner}/repos`, {
        name: repo,
        private: options.private,
        description: options.description,
        auto_init: false,
      });
    }
  }

  try {
    const user = await github(token, "GET", "/user");
    return await github(token, "GET", `/repos/${user.login}/${repo}`);
  } catch (error) {
    if (!/GET \/repos\//.test(error.message)) throw error;
    return github(token, "POST", "/user/repos", {
      name: repo,
      private: options.private,
      description: options.description,
      auto_init: false,
    });
  }
}

async function getBranchHead(token, owner, repo, branch) {
  try {
    const ref = await github(token, "GET", `/repos/${owner}/${repo}/git/ref/heads/${branch}`);
    const commit = await github(token, "GET", `/repos/${owner}/${repo}/git/commits/${ref.object.sha}`);
    return { refSha: ref.object.sha, treeSha: commit.tree.sha };
  } catch {
    return null;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.repo) {
    usage();
    process.exit(args.help ? 0 : 1);
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("Missing GITHUB_TOKEN environment variable.");

  const root = path.resolve(args.dir);
  const files = collectFiles(root);
  if (!files.length) throw new Error(`No uploadable files found in ${root}`);

  const repo = await ensureRepo(token, args.owner, args.repo, args);
  const owner = repo.owner.login;
  const repoName = repo.name;
  const head = await getBranchHead(token, owner, repoName, args.branch);

  const tree = [];
  for (const file of files) {
    const buffer = fs.readFileSync(file.full);
    const content = isBinary(buffer)
      ? buffer.toString("base64")
      : buffer.toString("utf8");
    const blob = await github(token, "POST", `/repos/${owner}/${repoName}/git/blobs`, {
      content,
      encoding: isBinary(buffer) ? "base64" : "utf-8",
    });
    tree.push({
      path: file.rel,
      mode: "100644",
      type: "blob",
      sha: blob.sha,
    });
    console.log(`prepared ${file.rel}`);
  }

  const newTree = await github(token, "POST", `/repos/${owner}/${repoName}/git/trees`, {
    base_tree: head?.treeSha,
    tree,
  });

  const commit = await github(token, "POST", `/repos/${owner}/${repoName}/git/commits`, {
    message: "Initial open-source release",
    tree: newTree.sha,
    parents: head ? [head.refSha] : [],
  });

  if (head) {
    await github(token, "PATCH", `/repos/${owner}/${repoName}/git/refs/heads/${args.branch}`, {
      sha: commit.sha,
      force: false,
    });
  } else {
    await github(token, "POST", `/repos/${owner}/${repoName}/git/refs`, {
      ref: `refs/heads/${args.branch}`,
      sha: commit.sha,
    });
  }

  console.log(`Uploaded ${files.length} files.`);
  console.log(repo.html_url);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
