const DIRECT_VIDEO_RE = /\.(mp4|webm|mov|m4v|ogv)(?=([?#]|$))/i;
const STREAM_RE = /\.(m3u8|mpd)(?=([?#]|$))/i;

chrome.action.onClicked.addListener(downloadFromTab);

chrome.commands.onCommand.addListener(async (command, activeTab) => {
  if (command !== "download-current-video") return;
  const [queriedTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const tab = activeTab?.id ? activeTab : queriedTab;
  await downloadFromTab(tab);
});

async function downloadFromTab(tab) {
  if (!tab?.id || !/^https?:|^file:/i.test(tab.url || "")) {
    await setBadge(tab?.id, "!");
    return;
  }

  try {
    await setBadge(tab.id, "");

    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: collectVideoCandidates,
    });

    const candidate = pickBestCandidate(result?.candidates || []);

    if (!candidate) {
      await showToast(tab.id, "没有找到可直接下载的视频。请先播放视频几秒后再试。");
      await setBadge(tab.id, "无");
      return;
    }

    if (candidate.url.startsWith("blob:")) {
      await showToast(tab.id, "当前视频是 blob/受保护流，扩展不能直接下载。");
      await setBadge(tab.id, "BLOB");
      return;
    }

    if (STREAM_RE.test(candidate.url) || candidate.type === "stream") {
      await showToast(tab.id, "当前视频是分段流，扩展不合并分段视频。");
      await setBadge(tab.id, "流");
      return;
    }

    const filename = buildFilename(result?.title || tab.title || "video", candidate.url);

    await chrome.downloads.download({
      url: candidate.url,
      filename,
      conflictAction: "uniquify",
      saveAs: false,
    });

    await showToast(tab.id, `已开始下载：${filename.split("/").pop()}`);
    await setBadge(tab.id, "↓");
    setTimeout(() => setBadge(tab.id, ""), 3500);
  } catch (error) {
    await showToast(tab.id, `下载失败：${error?.message || "未知错误"}`);
    await setBadge(tab.id, "!");
  }
}

async function setBadge(tabId, text) {
  if (!tabId) return;
  await chrome.action.setBadgeText({ tabId, text });
  await chrome.action.setBadgeBackgroundColor({ tabId, color: "#1677ff" });
}

async function showToast(tabId, message) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: injectToast,
      args: [message],
    });
  } catch {
    // Browser-owned pages can block injection; the badge still gives feedback.
  }
}

function pickBestCandidate(candidates) {
  const unique = [];
  const seen = new Set();

  for (const item of candidates) {
    if (!item?.url || seen.has(item.url)) continue;
    seen.add(item.url);
    unique.push(item);
  }

  const direct = unique
    .filter((item) => !item.url.startsWith("blob:"))
    .filter((item) => item.type !== "stream")
    .filter((item) => DIRECT_VIDEO_RE.test(item.url) || looksLikeDownloadableVideo(item.url));

  return direct.sort((a, b) => (b.score || 0) - (a.score || 0))[0]
    || unique.sort((a, b) => (b.score || 0) - (a.score || 0))[0];
}

function looksLikeDownloadableVideo(url) {
  const lower = url.toLowerCase();
  return lower.includes("mime_type=video_mp4")
    || lower.includes("video_mp4")
    || lower.includes("/video/tos/")
    || lower.includes("douyinvod.com")
    || lower.includes("bytevodd.com")
    || lower.includes("video_id=");
}

function buildFilename(title, url) {
  const extension = extensionFromUrl(url);
  const safeTitle = String(title)
    .replace(/[\\/:*?"<>|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80) || "video";

  return `Video Downloads/${safeTitle}.${extension}`;
}

function extensionFromUrl(url) {
  const directMatch = url.match(DIRECT_VIDEO_RE);
  if (directMatch) return directMatch[1].toLowerCase();

  const streamMatch = url.match(STREAM_RE);
  if (streamMatch) return streamMatch[1].toLowerCase();

  if (/webm/i.test(url)) return "webm";
  if (/mov/i.test(url)) return "mov";
  return "mp4";
}

function collectVideoCandidates() {
  const directVideoRe = /\.(mp4|webm|mov|m4v|ogv)(?=([?#]|$))/i;
  const streamRe = /\.(m3u8|mpd)(?=([?#]|$))/i;
  const candidates = [];
  const add = (url, source, score = 0, type = "video") => {
    if (!url) return;
    try {
      const absoluteUrl = url.startsWith("blob:")
        ? url
        : new URL(url, document.baseURI).href;
      candidates.push({ url: absoluteUrl, source, score, type });
    } catch {
      // Ignore malformed URLs from page scripts.
    }
  };

  document.querySelectorAll("video").forEach((video, index) => {
    const rect = video.getBoundingClientRect();
    const visibleArea = Math.max(0, rect.width) * Math.max(0, rect.height);
    const score = 1000 + visibleArea + (video.duration || 0);

    add(video.currentSrc, `video.currentSrc#${index}`, score);
    add(video.src, `video.src#${index}`, score - 1);

    video.querySelectorAll("source").forEach((source, sourceIndex) => {
      add(source.src, `video source#${index}.${sourceIndex}`, score - 2);
    });
  });

  document.querySelectorAll("source[src]").forEach((source, index) => {
    add(source.src, `source#${index}`, 500);
  });

  document.querySelectorAll("a[href]").forEach((link, index) => {
    const href = link.href;
    if (directVideoRe.test(href) || streamRe.test(href)) {
      add(href, `link#${index}`, 250, streamRe.test(href) ? "stream" : "video");
    }
  });

  performance.getEntriesByType("resource").forEach((entry, index) => {
    const url = entry.name || "";
    const lower = url.toLowerCase();
    const isDirect = directVideoRe.test(url)
      || lower.includes("mime_type=video_mp4")
      || lower.includes("douyinvod.com")
      || lower.includes("/video/tos/");
    const isStream = streamRe.test(url);
    const isVideoInitiator = entry.initiatorType === "video";

    if (isDirect || isStream || isVideoInitiator) {
      add(
        url,
        `resource#${index}`,
        700 + (entry.transferSize || entry.encodedBodySize || 0) / 1024,
        isStream ? "stream" : "video",
      );
    }
  });

  return {
    title: document.title,
    url: location.href,
    candidates,
  };
}

function injectToast(message) {
  const existing = document.getElementById("__edge_video_downloader_toast__");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "__edge_video_downloader_toast__";
  toast.textContent = message;
  toast.style.cssText = [
    "position:fixed",
    "z-index:2147483647",
    "right:16px",
    "top:16px",
    "max-width:min(420px,calc(100vw - 32px))",
    "padding:12px 14px",
    "border-radius:8px",
    "background:rgba(18,18,18,.92)",
    "color:#fff",
    "font:14px/1.45 system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
    "box-shadow:0 8px 24px rgba(0,0,0,.28)",
    "word-break:break-word",
  ].join(";");

  document.documentElement.appendChild(toast);
  setTimeout(() => toast.remove(), 4500);
}
