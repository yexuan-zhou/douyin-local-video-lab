# Tools

## Runtime

| Tool | Purpose |
|---|---|
| Node.js 20+ | CLI scripts, local file processing, local HTTP server |
| Playwright | Controls Edge/Chromium for local MP4 frame capture |
| Microsoft Edge / Chromium | Decodes local video and provides frame screenshots |
| Chrome Extensions API | Optional authorized direct-video helper |

## Browser Extension APIs

| API | Purpose |
|---|---|
| `chrome.action` | Toolbar button and badge feedback |
| `chrome.scripting` | Finds direct HTML5 video candidates in the current tab |
| `chrome.downloads` | Starts a normal browser save action |
| `chrome.commands` | Keyboard shortcut support |

## Local Directories

| Directory | Commit? | Purpose |
|---|---|---|
| `scripts/` | Yes | Reusable CLI utilities |
| `extension/` | Yes | Optional browser helper source |
| `docs/` | Yes | Compliance, product, and workflow docs |
| `web-demo/` | Yes | Static showcase pages |
| `examples/` | Yes | Fictional sample report data |
| `downloads/` | No | Local authorized videos |
| `artifacts/` | No | Extracted frames and generated reports |
| `node_modules/` | No | Installed dependencies |

## Current Components

- Local frame extractor: `scripts/extract-frames.js`
- Contact-sheet generator: `scripts/make-contact-sheet.js`
- Static demo opener: `scripts/open-demo.js`
- Demo validator: `scripts/validate-demo.js`
- Optional authorized-source resolver: `scripts/douyin-download.js`
- Authorized direct-video helper extension: `extension/edge-video-downloader`
