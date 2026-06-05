#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { Readable } = require("stream");
const { pipeline } = require("stream/promises");

const USER_AGENT = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 aweme";

function usage() {
  console.log(`Usage:
  node scripts/douyin-download.js <douyin-share-url|aweme-id|video-uri> [options]

Options:
  --out-dir <dir>     Output directory. Default: downloads
  --filename <name>   Custom filename. Default: title from page
  --ratio <ratio>     Requested ratio. Default: 720p
  --dry-run           Print resolved metadata without downloading
  --help              Show this help

Examples:
  npm run download -- "https://v.douyin.com/xxxxxxx/"
  npm run download -- 7640727223443410230 --out-dir downloads
`);
}

function parseArgs(argv) {
  const args = {
    input: null,
    outDir: "downloads",
    filename: null,
    ratio: "720p",
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const item = argv[i];
    if (item === "--help" || item === "-h") args.help = true;
    else if (item === "--dry-run") args.dryRun = true;
    else if (item === "--out-dir") args.outDir = argv[++i];
    else if (item === "--filename") args.filename = argv[++i];
    else if (item === "--ratio") args.ratio = argv[++i];
    else if (!args.input) args.input = item;
    else throw new Error(`Unexpected argument: ${item}`);
  }

  return args;
}

async function fetchText(url, options = {}) {
  const response = await fetch(url, {
    redirect: "follow",
    headers: {
      "user-agent": USER_AGENT,
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      ...options.headers,
    },
  });

  const text = await response.text();
  return { response, text };
}

function decodeHtml(text) {
  return String(text)
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x2F;/g, "/");
}

function extractAwemeId(text) {
  const candidates = [
    /\/video\/(\d{10,})/i,
    /modal_id=(\d{10,})/i,
    /aweme_id["':=\s]+(\d{10,})/i,
    /"awemeId"\s*:\s*"(\d{10,})"/i,
    /"aweme_id"\s*:\s*"(\d{10,})"/i,
  ];

  for (const pattern of candidates) {
    const match = text.match(pattern);
    if (match) return match[1];
  }

  if (/^\d{10,}$/.test(text.trim())) return text.trim();
  return null;
}

function extractMetaContent(html, key) {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${key}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${key}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${key}["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${key}["']`, "i"),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return decodeHtml(match[1]).trim();
  }
  return null;
}

function extractTitle(html) {
  const og = extractMetaContent(html, "og:description")
    || extractMetaContent(html, "description")
    || extractMetaContent(html, "og:title");
  if (og) return og;

  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return title ? decodeHtml(title[1]).trim() : "video";
}

function extractPlayUri(html) {
  const variants = [
    html,
    decodeHtml(html),
    decodeHtml(html).replace(/\\"/g, '"'),
  ];

  const patterns = [
    /"play_addr"\s*:\s*\{[\s\S]{0,2500}?"uri"\s*:\s*"([^"]+)"/i,
    /"uri"\s*:\s*"(v[0-9a-zA-Z]+)"/i,
    /"video_id"\s*:\s*"([^"]+)"/i,
    /video_id=([^"&\s]+)/i,
  ];

  for (const body of variants) {
    for (const pattern of patterns) {
      const match = body.match(pattern);
      if (match) return match[1].replace(/\\u002F/g, "/");
    }
  }

  return null;
}

async function resolveInput(input) {
  if (/^v[0-9a-zA-Z]{12,}$/.test(input)) {
    return {
      awemeId: null,
      playUri: input,
      title: "video",
      sourceUrl: null,
    };
  }

  let awemeId = extractAwemeId(input);
  let sourceUrl = null;
  let firstPage = "";

  if (!awemeId && /^https?:\/\//i.test(input)) {
    const { response, text } = await fetchText(input);
    sourceUrl = response.url;
    firstPage = text;
    awemeId = extractAwemeId(response.url) || extractAwemeId(text);
  }

  if (!awemeId) {
    throw new Error("Could not resolve a Douyin aweme/video id from the input.");
  }

  const shareUrls = [
    `https://www.iesdouyin.com/share/video/${awemeId}/?from_ssr=1`,
    `https://www.douyin.com/video/${awemeId}`,
  ];

  let html = firstPage;
  let finalUrl = sourceUrl;

  for (const url of shareUrls) {
    const result = await fetchText(url, {
      headers: {
        referer: sourceUrl || "https://www.douyin.com/",
      },
    });
    if (result.text && result.text.length > html.length) {
      html = result.text;
      finalUrl = result.response.url;
    }
    if (extractPlayUri(result.text)) break;
  }

  const playUri = extractPlayUri(html);
  if (!playUri) {
    throw new Error("Could not find a public playable video uri in the page HTML.");
  }

  return {
    awemeId,
    playUri,
    title: extractTitle(html),
    sourceUrl: finalUrl,
  };
}

function buildPlayUrl(playUri, ratio) {
  const url = new URL("https://aweme.snssdk.com/aweme/v1/playwm/");
  url.searchParams.set("line", "0");
  url.searchParams.set("logo_name", "aweme_diversion_search");
  url.searchParams.set("ratio", ratio);
  url.searchParams.set("video_id", playUri);
  return url.href;
}

function safeFilename(name) {
  const cleaned = String(name || "video")
    .replace(/[\\/:*?"<>|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 90);
  return cleaned || "video";
}

async function downloadFile(url, target, referer) {
  fs.mkdirSync(path.dirname(target), { recursive: true });

  const response = await fetch(url, {
    headers: {
      "user-agent": USER_AGENT,
      "referer": referer || "https://www.douyin.com/",
      "accept": "*/*",
    },
  });

  if (!response.ok || !response.body) {
    throw new Error(`Download failed: HTTP ${response.status}`);
  }

  const tempTarget = `${target}.part`;
  await pipeline(Readable.fromWeb(response.body), fs.createWriteStream(tempTarget));
  fs.renameSync(tempTarget, target);

  const header = fs.readFileSync(target, { encoding: null, flag: "r" }).subarray(0, 16).toString("latin1");
  const size = fs.statSync(target).size;
  return {
    size,
    looksLikeMp4: header.includes("ftyp"),
    contentType: response.headers.get("content-type"),
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.input) {
    usage();
    process.exit(args.help ? 0 : 1);
  }

  const resolved = await resolveInput(args.input);
  const playUrl = buildPlayUrl(resolved.playUri, args.ratio);
  const filename = `${safeFilename(args.filename || resolved.title)}.mp4`;
  const target = path.resolve(args.outDir, filename);

  const metadata = {
    awemeId: resolved.awemeId,
    playUri: resolved.playUri,
    title: resolved.title,
    sourceUrl: resolved.sourceUrl,
    playUrl,
    target,
  };

  if (args.dryRun) {
    console.log(JSON.stringify(metadata, null, 2));
    return;
  }

  const result = await downloadFile(playUrl, target, resolved.sourceUrl);
  console.log(JSON.stringify({ ...metadata, ...result }, null, 2));

  if (!result.looksLikeMp4) {
    console.warn("Warning: downloaded file does not look like an MP4. The platform response may have changed.");
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
