# 用户操作手册

软件名称：Local Video Lab 本地视频素材归档与AI复盘系统  
版本号：V1.0

## 1. 软件简介

Local Video Lab 本地视频素材归档与AI复盘系统是一款面向创作者、剪辑师、内容团队和教学研究场景的本地视频素材处理工具。系统用于整理用户本人拥有权利或已获授权的视频素材，并围绕本地视频文件完成关键帧抽取、内容摘要、复盘报告生成和 Web Demo 预览。

本系统默认采用本地优先的处理方式，不要求用户输入平台登录凭据，不主动上传用户视频，不保存用户隐私凭据。

## 2. 安装步骤

### 2.1 准备运行环境

用户需要先安装：

- Node.js 20 或以上版本
- Microsoft Edge 或 Chromium 浏览器

### 2.2 获取软件文件

将项目文件下载或复制到本地目录，例如：

```text
Local-Video-Lab/
```

### 2.3 安装依赖

在项目根目录打开命令行，执行：

```bash
npm install
```

如果仅需进行基础检查或文档预览，也可以执行：

```bash
npm install --ignore-scripts
```

### 2.4 检查安装结果

执行：

```bash
npm run check
```

如命令执行完成且未出现错误提示，表示基础环境可用。

## 3. 本地视频导入

### 3.1 准备视频素材

用户应准备本人拥有权利或已获授权的视频素材，例如本地导出的 MP4 文件。

### 3.2 放入本地目录

建议将视频文件放入项目根目录下的 `downloads/` 文件夹：

```text
downloads/sample-video.mp4
```

该目录用于保存用户本地素材，不会被提交到源码仓库。

### 3.3 素材命名建议

建议使用清晰、可识别的文件名，例如：

```text
2026-campus-cafe-launch.mp4
client-project-review-v1.mp4
portfolio-demo-video.mp4
```

## 4. 关键帧抽取

### 4.1 按数量抽取关键帧

在项目根目录执行：

```bash
npm run frames -- "downloads/sample-video.mp4" --duration 120 --count 24
```

参数说明：

- `downloads/sample-video.mp4`：本地视频文件路径。
- `--duration 120`：视频时长提示，单位为秒。
- `--count 24`：抽取 24 张关键帧。

### 4.2 按指定时间点抽取关键帧

也可以指定时间点：

```bash
npm run frames -- "downloads/sample-video.mp4" --times 3,12,24,36,60,90
```

系统会在对应秒数附近截取视频画面。

### 4.3 查看抽帧结果

抽取结果默认保存在：

```text
artifacts/frames/
```

每个视频会生成独立目录，目录中包含图片文件和 `frames.json` 记录文件。

## 5. 摘要生成

### 5.1 生成关键帧总览

执行：

```bash
npm run sheet -- "artifacts/frames/sample-video" --title "Sample Video Review"
```

系统会生成：

```text
artifacts/frames/sample-video/contact-sheet.html
```

### 5.2 编写摘要内容

用户可根据关键帧、字幕、画面变化和视频结构填写摘要。建议包括：

- 视频主题
- 开头钩子
- 主要内容段落
- 关键画面
- 结尾表达
- 内容亮点
- 可优化建议

### 5.3 使用模板

可参考：

```text
examples/analysis-template.md
examples/sample-report-data.json
```

模板用于规范复盘报告结构。

## 6. 报告导出

### 6.1 HTML 报告

系统支持通过 Web Demo 和 contact sheet 生成 HTML 页面，用于预览和演示。

### 6.2 Markdown 报告

用户可根据 `examples/analysis-template.md` 填写 Markdown 格式复盘内容，便于复制到文档、项目说明或客户交付材料中。

### 6.3 CSV 数据

系统预留 CSV 导出方向，可将关键时间点、标签和复盘结论整理为表格数据，用于后续内容管理和团队协作。

## 7. Web Demo 预览

### 7.1 打开产品页面

执行：

```bash
npm run demo
```

系统会打开：

```text
web-demo/index.html
web-demo/demo-report.html
```

### 7.2 查看产品首页

`web-demo/index.html` 展示系统定位、核心功能、适用人群、价格方案和合规提示。

### 7.3 查看样例报告

`web-demo/demo-report.html` 展示一个虚构短视频项目的复盘报告，包括视频信息、摘要、关键帧占位、节奏分析、亮点、优化建议、标签和导出信息。

## 8. 注意事项

1. 本软件仅用于处理用户本人拥有权利或已获授权的视频素材。
2. 请勿将未经授权的视频用于复制、传播、商业交付或公开展示。
3. 本软件默认不要求输入平台登录凭据或其他隐私凭据。
4. 本软件默认不上传用户视频文件。
5. 用户应自行确认素材来源、授权范围和使用场景符合相关法律法规。
6. 生成的报告、关键帧和本地素材应由用户妥善保存和管理。
7. `downloads/`、`artifacts/` 等目录属于本地数据目录，不建议纳入源码发布范围。
