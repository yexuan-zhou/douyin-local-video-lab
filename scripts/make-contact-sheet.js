#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

function usage() {
  console.log(`Usage:
  node scripts/make-contact-sheet.js <frames-dir> [options]

Options:
  --out <file>   Output HTML path. Default: <frames-dir>/contact-sheet.html
  --title <text> Page title. Default: folder name
  --help         Show this help

Example:
  npm run sheet -- "artifacts/frames/video"
`);
}

function parseArgs(argv) {
  const args = { dir: null, out: null, title: null };
  for (let i = 0; i < argv.length; i++) {
    const item = argv[i];
    if (item === "--help" || item === "-h") args.help = true;
    else if (item === "--out") args.out = argv[++i];
    else if (item === "--title") args.title = argv[++i];
    else if (!args.dir) args.dir = item;
    else throw new Error(`Unexpected argument: ${item}`);
  }
  return args;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function toRelativeUrl(fromFile, targetFile) {
  return path.relative(path.dirname(fromFile), targetFile).replace(/\\/g, "/");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.dir) {
    usage();
    process.exit(args.help ? 0 : 1);
  }

  const dir = path.resolve(args.dir);
  if (!fs.existsSync(dir)) throw new Error(`Directory not found: ${dir}`);

  const out = path.resolve(args.out || path.join(dir, "contact-sheet.html"));
  const title = args.title || path.basename(dir);
  const images = fs.readdirSync(dir)
    .filter((name) => /\.(png|jpe?g|webp)$/i.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((name) => path.join(dir, name));

  if (!images.length) throw new Error(`No frame images found in: ${dir}`);

  const cards = images.map((file) => {
    const src = escapeHtml(toRelativeUrl(out, file));
    const label = escapeHtml(path.basename(file, path.extname(file)));
    return `<article class="card">
      <div class="frame full"><img src="${src}" alt="${label}"></div>
      <div class="frame subtitles"><img src="${src}" alt="${label} subtitle crop"></div>
      <div class="label">${label}</div>
    </article>`;
  }).join("\n");

  const html = `<!doctype html>
<html lang="zh-CN">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} - Contact Sheet</title>
<style>
  :root { color-scheme: light dark; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  body { margin: 0; background: #f5f5f5; color: #171717; }
  header { position: sticky; top: 0; z-index: 1; padding: 16px 20px; background: rgba(255,255,255,.94); border-bottom: 1px solid #ddd; }
  h1 { margin: 0; font-size: 20px; font-weight: 650; }
  .meta { margin-top: 4px; color: #666; font-size: 13px; }
  main { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; padding: 18px; }
  .card { background: #fff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
  .frame { background: #000; overflow: hidden; }
  .frame img { width: 100%; display: block; }
  .full { aspect-ratio: 16 / 9; }
  .full img { height: 100%; object-fit: contain; }
  .subtitles { height: 120px; border-top: 1px solid #222; }
  .subtitles img { height: 100%; object-fit: cover; object-position: center bottom; }
  .label { padding: 8px 10px; font-size: 13px; color: #444; }
  @media (prefers-color-scheme: dark) {
    body { background: #111; color: #f2f2f2; }
    header { background: rgba(20,20,20,.94); border-bottom-color: #333; }
    .card { background: #1a1a1a; border-color: #333; }
    .meta, .label { color: #aaa; }
  }
</style>
<header>
  <h1>${escapeHtml(title)}</h1>
  <div class="meta">${images.length} frames. Each card shows the full frame and a subtitle-focused crop.</div>
</header>
<main>
${cards}
</main>
</html>`;

  fs.writeFileSync(out, html, "utf8");
  console.log(out);
}

try {
  main();
} catch (error) {
  console.error(error.message || error);
  process.exit(1);
}
