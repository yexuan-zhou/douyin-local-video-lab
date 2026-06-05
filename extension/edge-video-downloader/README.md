# Authorized Direct Video Helper Extension

This optional Edge extension helps save direct HTML5 video resources from the current tab when the user owns the material or has permission to process it.

它只适用于用户本人拥有权利或已获授权的视频素材，不用于绕过平台限制、登录权限、付费墙、DRM 或分段流保护。

## Install

1. Open Edge and go to `edge://extensions/`.
2. Enable Developer mode.
3. Click "Load unpacked".
4. Select `extension/edge-video-downloader`.
5. Pin "授权视频保存助手" to the toolbar if needed.

## Use

1. Open a page containing an authorized direct HTML5 video.
2. Play the video briefly so the browser exposes the direct media URL.
3. Click the extension icon, or press `Alt+Shift+D`.

Saved files go to the browser's default download directory under `Video Downloads`.

## Limits

- It only handles direct video URLs already available to the page.
- It does not bypass DRM, login permission, paywalls, or access controls.
- It does not merge `m3u8` / `mpd` segmented streams or `blob:` media.
- It must not be used for unauthorized copying, redistribution, or commercial use.
