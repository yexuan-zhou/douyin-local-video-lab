# Short Video Local Archive & AI Review Tool

Repository name: `douyin-local-video-lab`

A local-first tool for creators and content teams to archive authorized short videos, extract key frames, generate summaries, and produce review reports.

一个本地优先的短视频素材归档与内容复盘工具，用于整理用户本人拥有权利或已获授权的视频素材，自动生成关键帧、摘要和复盘报告。

## Who It Is For

- Short-video creators
- Editors and post-production freelancers
- MCN and content teams
- Operations and content review staff
- Student portfolio or graduation-project media organization

## Core Features

- Local video import for creator-owned or authorized material
- Authorized video material archive workflow
- Automatic key-frame extraction from local MP4 files
- Video summary and content review report workflow
- CSV / Markdown / HTML report export foundations
- Local-first execution, with no default cloud upload
- Future Docker private deployment and desktop app support

## Compliance Notice

This project is intended only for creator-owned or authorized video materials. Do not use it to bypass platform restrictions, scrape content, download unauthorized videos, or infringe copyright.

本项目仅用于处理用户本人拥有版权或已获授权的视频素材。请勿用于绕过平台限制、抓取内容、保存未经授权的视频，或侵犯版权、肖像权、隐私权和平台规则。

## Quick Start

### 1. Install

```bash
npm install
```

For CI or environments where browser downloads are not needed:

```bash
npm install --ignore-scripts
```

### 2. Prepare A Sample Video

Place a creator-owned or authorized MP4 file in a local ignored folder:

```text
downloads/sample-video.mp4
```

`downloads/` and generated artifacts are ignored by Git.

### 3. Extract Key Frames

```bash
npm run frames -- "downloads/sample-video.mp4" --duration 120 --count 24
```

Output:

```text
artifacts/frames/sample-video/
```

### 4. Generate A Contact Sheet

```bash
npm run sheet -- "artifacts/frames/sample-video" --title "Sample Video Review"
```

Output:

```text
artifacts/frames/sample-video/contact-sheet.html
```

### 5. Open The Web Demo

```bash
npm run demo
```

This opens:

- `web-demo/index.html`
- `web-demo/demo-report.html`

### 6. Optional Authorized Source Resolver

The legacy resolver remains available for links or video IDs you are legally allowed to access and save. It is not a crawler, does not log in, does not read cookies, and does not bypass protected streams.

```bash
npm run download -- "https://example.com/authorized-short-video-link"
```

If a platform blocks access, requires login, uses DRM, or prohibits saving, do not attempt to bypass it.

## Scripts

| Command | Status | Purpose |
|---|---|---|
| `npm run demo` | Real | Opens the static product demo and sample report. |
| `npm run web-demo` | Real | Alias for `npm run demo`. |
| `npm run frames` | Real | Extracts key frames from a local authorized MP4. |
| `npm run sheet` | Real | Builds a local HTML contact sheet from extracted frames. |
| `npm run report` | Demo | Opens the sample report page. |
| `npm run download` | Legacy / optional | Resolves an authorized source link or video ID when lawful. |
| `npm run check` | Real | Syntax-checks Node.js scripts and validates demo files. |

## Web Demo

- [Product page](web-demo/index.html)
- [Sample report](web-demo/demo-report.html)
- [Sample report data](examples/sample-report-data.json)

The demo is static and uses fictional data only.

## Documentation

- [Compliance and Acceptable Use Policy](docs/compliance.md)
- [Monetization Plan](docs/monetization.md)
- [Product Roadmap](docs/roadmap.md)
- [Workflow](docs/workflow.md)
- [Architecture](docs/architecture.md)
- [Tools](docs/tools.md)
- [GitHub Upload Notes](docs/github-upload.md)

## Commercial Direction

- Local CLI version
- Desktop version
- Web demo
- Docker private deployment
- Team customization service

## Current Boundary

This is a showcase MVP and local workflow foundation, not a full SaaS product. It does not include user accounts, payment, cloud storage, or a production backend.
