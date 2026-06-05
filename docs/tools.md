# 工具清单

## 运行环境

| 工具 | 用途 |
|---|---|
| Node.js 20+ | CLI 脚本、下载、文件流处理、本地 HTTP server |
| Playwright | 控制 Edge/Chromium 播放本地 MP4、seek、截图 |
| Microsoft Edge / Chromium | 解码视频并提供 `<video>` 截图能力 |
| Edge Extensions API | 当前网页视频候选发现、一键下载 |

## 浏览器扩展 API

| API | 用途 |
|---|---|
| `chrome.action` | 工具栏按钮和 badge 反馈 |
| `chrome.scripting` | 注入候选视频采集函数和 toast |
| `chrome.downloads` | 调起浏览器下载 |
| `chrome.commands` | 支持快捷键触发 |

## 关键本地目录

| 目录 | 是否提交 | 用途 |
|---|---|---|
| `scripts/` | 是 | 通用 CLI |
| `extension/` | 是 | Edge 插件源码 |
| `docs/` | 是 | 工作流和架构说明 |
| `examples/` | 是 | 分析模板 |
| `downloads/` | 否 | 本地视频 |
| `artifacts/` | 否 | 抽帧、总览页等生成物 |
| `node_modules/` | 否 | 依赖安装目录 |

## 本次实践中形成的组件

- 链接解析下载器：`scripts/douyin-download.js`
- 本地抽帧器：`scripts/extract-frames.js`
- 关键帧总览生成器：`scripts/make-contact-sheet.js`
- 当前视频一键下载 Edge 扩展：`extension/edge-video-downloader`
- 分析输出模板：`examples/analysis-template.md`
