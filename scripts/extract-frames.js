#!/usr/bin/env node
"use strict";

const fs = require("fs");
const http = require("http");
const path = require("path");

function usage() {
  console.log(`Usage:
  node scripts/extract-frames.js <video-file> [options]

Options:
  --out <dir>          Output directory. Default: artifacts/frames/<video-name>
  --count <number>     Number of evenly spaced frames. Default: 36
  --duration <seconds> Duration hint if browser cannot read duration
  --times <list>       Comma-separated timestamps in seconds. Overrides --count
  --browser <name>     msedge or chromium. Default: msedge
  --help               Show this help

Examples:
  npm run frames -- "downloads/video.mp4" --duration 3460
  npm run frames -- "downloads/video.mp4" --times 30,60,120,300
`);
}

function parseArgs(argv) {
  const args = {
    file: null,
    out: null,
    count: 36,
    duration: null,
    times: null,
    browser: "msedge",
  };

  for (let i = 0; i < argv.length; i++) {
    const item = argv[i];
    if (item === "--help" || item === "-h") args.help = true;
    else if (item === "--out") args.out = argv[++i];
    else if (item === "--count") args.count = Number(argv[++i]);
    else if (item === "--duration") args.duration = Number(argv[++i]);
    else if (item === "--times") args.times = argv[++i].split(",").map(Number).filter(Number.isFinite);
    else if (item === "--browser") args.browser = argv[++i];
    else if (!args.file) args.file = item;
    else throw new Error(`Unexpected argument: ${item}`);
  }

  return args;
}

function safeName(name) {
  return String(name)
    .replace(/\.[^.]+$/, "")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80) || "video";
}

function startVideoServer(file) {
  const stat = fs.statSync(file);
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, "http://127.0.0.1");
    if (url.pathname !== "/video.mp4") {
      res.writeHead(404);
      res.end("not found");
      return;
    }

    const range = req.headers.range;
    if (range) {
      const [, startText, endText] = range.match(/bytes=(\d*)-(\d*)/) || [];
      const start = startText ? parseInt(startText, 10) : 0;
      const end = endText ? parseInt(endText, 10) : stat.size - 1;
      res.writeHead(206, {
        "Content-Type": "video/mp4",
        "Content-Length": end - start + 1,
        "Content-Range": `bytes ${start}-${end}/${stat.size}`,
        "Accept-Ranges": "bytes",
      });
      fs.createReadStream(file, { start, end }).pipe(res);
      return;
    }

    res.writeHead(200, {
      "Content-Type": "video/mp4",
      "Content-Length": stat.size,
      "Accept-Ranges": "bytes",
    });
    fs.createReadStream(file).pipe(res);
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      resolve({ server, origin: `http://127.0.0.1:${server.address().port}` });
    });
  });
}

async function waitForMetadata(video) {
  await video.evaluate((el) => new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("metadata timeout")), 20000);
    const done = () => {
      clearTimeout(timeout);
      resolve();
    };
    if (el.readyState >= 1) done();
    else el.addEventListener("loadedmetadata", done, { once: true });
    el.addEventListener("error", () => {
      clearTimeout(timeout);
      const err = el.error ? `${el.error.code}:${el.error.message}` : "unknown";
      reject(new Error(`video error ${err}`));
    }, { once: true });
    el.load();
  }));
}

async function waitForSeek(video, time) {
  await video.evaluate((el, t) => new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`seek timeout at ${t}s`)), 12000);
    const done = () => {
      clearTimeout(timeout);
      el.removeEventListener("seeked", done);
      resolve();
    };
    el.addEventListener("seeked", done, { once: true });
    el.currentTime = t;
  }), time);
  await video.evaluate((el) => new Promise((resolve) => {
    if (el.readyState >= 2) return resolve();
    el.addEventListener("loadeddata", () => resolve(), { once: true });
  }));
}

async function launchBrowser(chromium, browserName) {
  if (browserName === "chromium") return chromium.launch({ headless: true });
  try {
    return await chromium.launch({ channel: browserName, headless: true });
  } catch (error) {
    console.warn(`Could not launch ${browserName}; falling back to bundled chromium.`);
    return chromium.launch({ headless: true });
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.file) {
    usage();
    process.exit(args.help ? 0 : 1);
  }

  const file = path.resolve(args.file);
  if (!fs.existsSync(file)) throw new Error(`File not found: ${file}`);

  const outDir = path.resolve(args.out || path.join("artifacts", "frames", safeName(path.basename(file))));
  fs.mkdirSync(outDir, { recursive: true });

  const { chromium } = require("playwright");
  const { server, origin } = await startVideoServer(file);
  const browser = await launchBrowser(chromium, args.browser);

  const files = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
    await page.setContent(`<!doctype html>
      <meta charset="utf-8">
      <style>
        body { margin: 0; background: #111; display: grid; place-items: center; height: 100vh; }
        video { width: 1280px; height: 720px; object-fit: contain; background: #000; }
      </style>
      <video id="video" muted playsinline preload="auto" src="${origin}/video.mp4"></video>`);

    const video = page.locator("#video");
    await waitForMetadata(video);

    const reportedDuration = await video.evaluate((el) => el.duration);
    const duration = Number.isFinite(reportedDuration) && reportedDuration > 0
      ? reportedDuration
      : args.duration;

    if (!duration && !args.times?.length) {
      throw new Error("Browser could not read video duration. Pass --duration <seconds> or --times <list>.");
    }

    const times = args.times?.length
      ? args.times
      : Array.from({ length: args.count }, (_, i) => {
        return Math.max(0.2, Math.min(duration - 0.2, (duration * (i + 0.5)) / args.count));
      });

    for (let i = 0; i < times.length; i++) {
      const time = times[i];
      await waitForSeek(video, time);
      await page.waitForTimeout(160);
      const name = `${String(i + 1).padStart(2, "0")}_${Math.round(time)}s.png`;
      const target = path.join(outDir, name);
      await video.screenshot({ path: target });
      files.push(target);
    }

    await page.close();
  } finally {
    await browser.close();
    server.close();
  }

  const manifest = {
    input: file,
    outDir,
    frameCount: files.length,
    frames: files.map((item) => path.relative(outDir, item)),
  };
  fs.writeFileSync(path.join(outDir, "frames.json"), JSON.stringify(manifest, null, 2), "utf8");
  console.log(JSON.stringify(manifest, null, 2));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
