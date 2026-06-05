# Workflow: Authorized Local Video Review

This workflow turns creator-owned or authorized short-video material into a local archive, key-frame contact sheet, and review report.

## 1. Prepare Authorized Material

Use one of these source types:

- A video created by you or your team
- A client-provided video with explicit permission
- A licensed or publicly reusable sample
- A local export from your editing timeline

Place the MP4 in an ignored local folder:

```text
downloads/sample-video.mp4
```

## 2. Extract Key Frames

The frame extractor reads a local MP4 only. It starts a temporary local HTTP server so Edge/Chromium can seek through the file, then captures frames from the `<video>` element.

Evenly sampled frames:

```bash
npm run frames -- "downloads/sample-video.mp4" --duration 120 --count 24
```

Specific timestamps:

```bash
npm run frames -- "downloads/sample-video.mp4" --times 3,12,24,36,60,90
```

Use `--duration` when the browser cannot reliably read the MP4 duration.

## 3. Generate A Contact Sheet

```bash
npm run sheet -- "artifacts/frames/sample-video" --title "Sample Video Review"
```

The generated `contact-sheet.html` shows:

- Full-frame thumbnails
- Subtitle-focused crops
- Timestamp labels

This does not replace human review. It provides visual evidence for summary writing and AI-assisted analysis.

## 4. Write The Review

Recommended output format:

```markdown
| Video | What It Covers | Review Point |
|---|---|---|
| Title | One-sentence content summary | One-sentence evaluation or insight |
```

Review order:

1. Identify the opening hook or question.
2. Track the main turn, proof, or story beat.
3. Check the ending and call to action.
4. Only write conclusions supported by local frames, subtitles, or the source file.

## 5. Open The Static Demo

```bash
npm run demo
```

This opens a static product page and a fictional sample review report:

- `web-demo/index.html`
- `web-demo/demo-report.html`

## Optional Authorized Source Resolver

The historical resolver script is kept for authorized source links and IDs. It should only be used when the user has the right to access and save the material. It must not be extended into a crawler, login simulator, cookie collector, or platform restriction bypass tool.

## Boundaries

- Do not process unauthorized videos.
- Do not bypass DRM, login permissions, paywalls, or access controls.
- Do not collect or store account passwords, cookies, or private tokens.
- Do not commit local videos, frames, browser profiles, or generated artifacts.
- Keep all demos fictional and all user material local unless the user explicitly configures a third-party AI service.
