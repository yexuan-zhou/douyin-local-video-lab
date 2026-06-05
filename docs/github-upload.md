# 上传到 GitHub

本项目可以不依赖本机 Git，直接用 GitHub REST API 创建仓库并上传文件树。

## 1. 创建 GitHub 账号

打开：

```text
https://github.com/signup
```

注册账号、验证邮箱，并完成 GitHub 的人机验证。密码和验证码必须由你本人输入。

## 2. 创建临时 token

打开：

```text
https://github.com/settings/personal-access-tokens/new
```

建议创建 Fine-grained personal access token：

- Expiration：尽量短，例如 1 天或 7 天
- Repository access：All repositories，或按 GitHub 当前界面允许的最小范围选择
- Repository permissions：
  - Administration：Read and write，用于创建仓库
  - Contents：Read and write，用于上传源码文件
  - Workflows：Read and write，用于上传 `.github/workflows/check.yml`

上传完成后立刻删除或撤销这个 token。

## 3. 设置环境变量并上传

Windows PowerShell：

```powershell
$env:GITHUB_TOKEN = "粘贴你的临时 token"
node scripts/github-upload.js douyin-local-video-lab
```

公开仓库：

```powershell
node scripts/github-upload.js douyin-local-video-lab
```

私有仓库：

```powershell
node scripts/github-upload.js douyin-local-video-lab --private
```

## 4. 验证

脚本成功后会输出仓库 URL，例如：

```text
https://github.com/your-name/douyin-local-video-lab
```

打开仓库确认文件、README 和文档都存在即可。

## 安全提醒

- 不要把 token 写进代码、README、截图或聊天记录。
- 不要提交 `downloads/`、`artifacts/`、视频文件、浏览器缓存。
- 上传后撤销 token。
