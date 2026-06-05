# 开源前检查清单

- [ ] 确认仓库没有 MP4、截图帧、浏览器 profile、cookie、缓存。
- [ ] 确认 `downloads/`、`artifacts/`、`node_modules/` 没有被提交。
- [ ] 确认 README 写清楚合规边界。
- [ ] 确认 LICENSE 是否符合你的发布意图，默认是 MIT。
- [ ] 运行 `npm run check`。
- [ ] 在全新目录里执行一次 `npm install`。
- [ ] 用一个你有权保存的公开视频链接测试 `npm run download`。
- [ ] 用一个本地测试 MP4 跑 `npm run frames` 和 `npm run sheet`。
- [ ] Edge 扩展用开发者模式加载，确认按钮和快捷键可用。
- [ ] 如果用 `scripts/github-upload.js` 上传，上传后立刻撤销临时 token。

建议 GitHub 仓库描述：

```text
Download public short-video links for local archiving, sample frames, and summarize video content offline.
```
