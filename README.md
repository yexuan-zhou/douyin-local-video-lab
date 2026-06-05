# Douyin Local Video Lab

一个把“短链接下载视频 -> 本地抽帧 -> 读字幕/画面总结”的工作流整理成可复用工具的小项目。

## 能做什么

- 从公开视频分享链接解析视频信息，并下载为本地 MP4。
- 用本地 Edge/Chromium 播放本地 MP4，按时间点抽关键帧。
- 生成关键帧总览 HTML，方便人工或 AI 看字幕、梳理观点。
- 提供一个 Edge 扩展：对网页里已经暴露的直链 HTML5 视频做一键下载。

## 快速开始

```bash
npm install
npm run download -- "https://v.douyin.com/xxxxxxx/"
npm run frames -- "downloads/video.mp4" --duration 3460
npm run sheet -- "artifacts/frames/video"
```

输出默认进入：

- `downloads/`：下载的视频
- `artifacts/frames/`：抽出的关键帧
- `contact-sheet.html`：关键帧总览页

## Edge 扩展

1. 打开 Edge：`edge://extensions/`
2. 打开“开发人员模式”
3. 选择“加载解压缩的扩展”
4. 选择 `extension/edge-video-downloader`
5. 打开视频网页，先播放几秒，再点工具栏扩展图标

限制：扩展只处理页面已经暴露出来的直链视频，不绕过 DRM、登录权限、付费墙，也不合并 `m3u8`/`mpd` 分段流。

## 标准工作流

1. 输入分享链接，解析公开页面里的视频 ID、标题和播放资源。
2. 下载 MP4 到本地，不把视频提交到 Git。
3. 对本地 MP4 抽 30 到 60 张关键帧。
4. 生成总览页，按开头、转折、结尾读字幕和画面。
5. 输出“讲了什么”和“观点是什么”的短总结。

更完整说明见 [docs/workflow.md](docs/workflow.md)、[docs/architecture.md](docs/architecture.md)、[docs/tools.md](docs/tools.md) 和 [docs/github-upload.md](docs/github-upload.md)。

## 合规边界

本项目用于个人资料归档、学习笔记和本地内容理解。请只处理你有权访问和保存的公开视频内容，并遵守平台条款、版权规则和当地法律。
