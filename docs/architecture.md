# 项目结构与组件

```text
douyin-local-video-lab/
  scripts/
    douyin-download.js       # 分享链接解析 + MP4 下载
    extract-frames.js        # 本地 MP4 抽关键帧
    make-contact-sheet.js    # 关键帧 HTML 总览
  extension/
    edge-video-downloader/   # Edge 一键下载插件
  docs/
    workflow.md              # 端到端工作流
    architecture.md          # 组件说明
  examples/
    analysis-template.md     # 总结模板
```

## 组件说明

| 组件 | 输入 | 输出 | 作用 |
|---|---|---|---|
| `douyin-download.js` | 分享短链、视频 ID 或播放 URI | 本地 MP4 | 解析公开页面并下载 |
| `extract-frames.js` | 本地 MP4 | PNG 关键帧和 `frames.json` | 离线采样视频内容 |
| `make-contact-sheet.js` | 关键帧目录 | `contact-sheet.html` | 快速查看字幕和画面 |
| Edge 扩展 | 当前浏览器标签页 | 浏览器下载任务 | 一键保存直链 HTML5 视频 |

## 技术点

- `fetch`：解析短链和公开分享页。
- Node.js stream：大文件下载，不一次性读入内存。
- 本地 HTTP Range server：让浏览器像播放远程视频一样播放本地 MP4。
- Playwright + Edge/Chromium：自动 seek、暂停、截图。
- Chrome Extensions Manifest V3：通过 `chrome.scripting` 和 `chrome.downloads` 找视频并下载。

## 数据流

```mermaid
flowchart LR
  A["Douyin share link"] --> B["Resolve public page"]
  B --> C["Extract video id / play uri"]
  C --> D["Download MP4"]
  D --> E["Local frame sampler"]
  E --> F["Frame images"]
  F --> G["Contact sheet"]
  G --> H["Human / AI summary"]
```

## 为什么不提交生成物

视频、关键帧、浏览器缓存都可能包含版权内容、个人浏览信息或大文件。开源仓库只保留可复用代码和说明，所有生成物放入 `downloads/` 或 `artifacts/` 并由 `.gitignore` 排除。
