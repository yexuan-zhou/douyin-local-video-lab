# 源代码材料整理说明

软件名称：Local Video Lab 本地视频素材归档与AI复盘系统  
版本号：V1.0

## 1. 源代码提交原则

申请软件著作权登记时，应提交能够体现软件核心功能和技术实现的源代码材料。源代码材料应保持连续、清晰、可读，并与申请软件名称和版本号一致。

## 2. 页数要求

通常可按以下方式整理：

1. 提交源代码前后各连续 30 页，共 60 页。
2. 如果全部源代码不足 60 页，则提交全部源代码。
3. 每页建议保持固定行数和清晰排版，便于审查。

## 3. 页眉标注

每页页眉建议标注：

```text
Local Video Lab 本地视频素材归档与AI复盘系统 V1.0
```

也可同时标注页码，例如：

```text
Local Video Lab 本地视频素材归档与AI复盘系统 V1.0    第 1 页
```

## 4. 建议包含的源码范围

可优先选择以下项目源码：

- `scripts/extract-frames.js`
- `scripts/make-contact-sheet.js`
- `scripts/open-demo.js`
- `scripts/validate-demo.js`
- `web-demo/index.html`
- `web-demo/demo-report.html`
- `web-demo/styles.css`
- `extension/edge-video-downloader/background.js`

如需体现系统整体结构，可适当加入配置文件和样例数据文件。

## 5. 不应包含的内容

源代码材料中不应包含：

- 第三方库源码，例如 `node_modules/`
- 用户本地视频文件
- 抽取生成的关键帧图片
- 本地缓存、浏览器 profile 或临时文件
- 账号信息、登录密钥、访问凭据等隐私或敏感信息
- 与申请软件无关的测试数据或私人文件

## 6. 格式建议

1. 使用等宽字体排版。
2. 保持代码缩进和换行。
3. 每页内容连续，不随意跳页。
4. 页码和页眉保持一致。
5. 如果使用 PDF 提交，建议先生成预览并检查中文、英文和符号是否显示正常。

## 7. 归档建议

建议建立独立材料目录保存最终提交版本：

```text
software-copyright-submission/
  source-code-pages.pdf
  user-manual.pdf
  screenshots/
  rights-statement.pdf
```

正式提交前，应再次检查材料中不存在账号信息、登录密钥、访问凭据、私人联系方式或未经授权的视频素材。
