# Open Source Checklist

- [ ] Confirm the repository has no MP4 files, extracted frames, browser profiles, cookies, caches, or private local reports.
- [ ] Confirm `downloads/`, `artifacts/`, and `node_modules/` are not committed.
- [ ] Confirm README clearly states the creator-owned / authorized-content boundary.
- [ ] Confirm LICENSE matches the intended release model; the default is MIT.
- [ ] Run `npm run check`.
- [ ] Run `npm install` or `npm install --ignore-scripts` in a clean environment.
- [ ] Test `npm run frames` with a local video you own or are authorized to process.
- [ ] Test `npm run sheet` with generated frames.
- [ ] Open `web-demo/index.html` and `web-demo/demo-report.html`.
- [ ] Load the browser helper extension only for authorized direct-video material.
- [ ] If using `scripts/github-upload.js`, revoke the temporary GitHub credential immediately after upload.

Suggested GitHub repository description:

```text
Local-first short-video archive and AI review workflow for creator-owned or authorized content.
```
