# 软著说明书功能截图清单

软件名称：Local Video Lab 本地视频素材归档与AI复盘系统  
版本号：V1.0

以下截图可用于整理软件著作权登记说明书、用户手册或功能展示材料。

## 1. 首页

- Web Demo 首页完整截图
- 产品名称和系统定位区域
- 核心功能模块区域
- 合规提示区域

建议页面：

```text
web-demo/index.html
```

## 2. 导入视频

- 本地视频文件放入 `downloads/` 目录的示意截图
- 命令行中输入本地视频路径的截图
- 本地素材命名规则示例截图

建议展示内容：

```text
downloads/sample-video.mp4
npm run frames -- "downloads/sample-video.mp4" --duration 120 --count 24
```

## 3. 抽帧结果

- `artifacts/frames/` 目录中的关键帧图片列表
- `frames.json` 文件记录截图
- 关键帧总览页面截图

建议展示内容：

```text
artifacts/frames/sample-video/
artifacts/frames/sample-video/contact-sheet.html
```

## 4. 摘要结果

- 样例报告中的 Content Summary 区域
- 内容亮点区域
- 可优化建议区域
- 标签区域

建议页面：

```text
web-demo/demo-report.html
```

## 5. 报告页面

- 样例复盘报告完整页面截图
- 视频基本信息区域
- 关键帧展示区域
- 镜头节奏分析区域
- 导出信息区域

建议页面：

```text
web-demo/demo-report.html
```

## 6. 导出文件

- HTML 报告文件截图
- Markdown 模板文件截图
- 样例 JSON 数据文件截图

建议展示文件：

```text
web-demo/demo-report.html
examples/analysis-template.md
examples/sample-report-data.json
```

## 截图整理建议

1. 截图中不要出现个人账号、密码、Token、Cookie 或私人文件路径。
2. 截图中的视频素材应为本人创作、已获授权或虚构样例。
3. 截图应保持清晰，能看清软件名称、功能区域和操作结果。
4. 每张截图建议配一句简短说明，说明该截图对应的软件功能。
