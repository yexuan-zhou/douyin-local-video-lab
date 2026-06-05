#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const sourceDir = path.join(root, "docs", "software-copyright-materials");
const outputDir = path.join(root, "output", "software-copyright-materials");

const files = [
  "software-info.md",
  "user-manual.md",
  "source-code-export-guide.md",
  "rights-statement.md",
  "screenshots-checklist.md",
  "trademark-name-ideas.md",
  "application-checklist.md",
];

function ensureDirectory(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyMaterial(file) {
  const source = path.join(sourceDir, file);
  const target = path.join(outputDir, file);
  if (!fs.existsSync(source)) {
    throw new Error(`Missing required material: ${path.relative(root, source)}`);
  }
  fs.copyFileSync(source, target);
  return path.relative(root, target);
}

function writeReadme(copiedFiles) {
  const readme = [
    "Local Video Lab 本地视频素材归档与AI复盘系统 V1.0",
    "软件著作权申请准备材料",
    "",
    "用途：",
    "这些文件用于准备中国软件著作权登记申请材料，包括软件基本信息、用户手册、权属说明、截图清单、源代码整理说明和申请信息清单。",
    "",
    "申请前请手动填写：",
    "- 申请人姓名或公司名称",
    "- 证件类型和证件号码",
    "- 联系方式和通讯地址",
    "- 开发完成日期",
    "- 首次发表日期和是否发表",
    "- 开发方式和权利取得方式",
    "- 源代码页数和用户手册页数",
    "",
    "安全提醒：",
    "- 不要把证件号码、私人联系方式、住址等隐私信息提交到公开 GitHub 仓库。",
    "- 不要把本地视频素材、截图原图、生成物或私人项目文件提交到公开仓库。",
    "- 本软件材料统一表述为处理用户本人拥有权利或已获授权的视频素材。",
    "",
    "PDF 导出提示：",
    "当前脚本只整理 Markdown 文档和说明文件，不直接生成 PDF。",
    "请使用 VS Code、Typora、Word、浏览器打印或其他文档工具，将 Markdown 手动导出为 PDF 或复制到 Word 后排版导出。",
    "",
    "已复制文件：",
    ...copiedFiles.map((file) => `- ${file}`),
    "",
  ].join("\r\n");

  fs.writeFileSync(path.join(outputDir, "README.txt"), readme, "utf8");
}

function main() {
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Source directory not found: ${path.relative(root, sourceDir)}`);
  }

  ensureDirectory(outputDir);
  const copiedFiles = files.map(copyMaterial);
  writeReadme(copiedFiles);

  console.log(JSON.stringify({
    ok: true,
    outputDir: path.relative(root, outputDir),
    copiedFiles,
    readme: path.relative(root, path.join(outputDir, "README.txt")),
    pdfNote: "Markdown files are ready. Export PDF manually with VS Code, Typora, Word, or browser print.",
  }, null, 2));
}

try {
  main();
} catch (error) {
  console.error(error.message || error);
  process.exit(1);
}
