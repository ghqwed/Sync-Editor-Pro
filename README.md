<div align="center">
  <img width="1200" height="475" alt="Bilingual Sync Editor" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

<p align="center">
  <strong>中文版本</strong> ｜ <a href="./README_en.md">English Version</a>
</p>

# Sync Editor Pro

Sync Editor Pro 是一款面向英文文档的双语同步编辑器，支持导入 Word/Markdown、自动拆分句子、批量或单句翻译、历史撤销以及工程导入导出。用户可在界面中配置 Base URL / Model / API Key，方便使用个人的 Gemini 或 OpenAI 兼容接口。

## 主要特性

- **文档导入与分段**：支持 `.docx / .md / .txt`，自动拆分段落与句子。
- **双语并排编辑**：任意一侧修改都会同步另一侧，支持合并/拆分句子与悬停高亮。
- **批量与单句翻译**：并发调用 Gemini 或其他 OpenAI 兼容接口。
- **翻译风格预设**：维护多套 Prompt，在 UI 中编辑并保存到 `localStorage`。
- **完整撤销系统**：最多 50 条历史快照，`Ctrl+Z` 快速撤回，内置编辑锁确保输入顺畅。
- **工程导入导出**：Zip 包含段落、风格、原文件、API 设置，跨设备继续翻译。
- **界面级 API 设置**：在设置面板填写 Base URL / Model / API Key，并可一键测试连通性。

## 技术栈

- Vite 6
- React 19
- TypeScript
- TailwindCSS（CDN）+ 自定义样式
- Google Gemini SDK / OpenAI 兼容接口

## 环境要求

- Node.js 18+
- npm（随 Node 安装）

> `.env.local` 中的 `GEMINI_API_KEY` 仅作为兜底；推荐直接在界面中录入密钥，方便每位用户自定义。

## 安装与运行

```bash
git clone <repo>
cd Sync-Editor-Pro
npm install
npm run dev
```

根据终端提示访问 `http://localhost:3000/`（若端口被占用会自动切换到 `3001+`）。首次进入页面为空，上传文档或导入工程即可开始。

### API 配置步骤

1. 点击右上角齿轮打开 **API & 模型配置**。
2. 输入 Base URL（可选）、模型名称、API Key。
3. 先点击“测试连接”，成功后再保存设置。

> 希望通过环境变量预置密钥，可在 `.env.local` 写入 `GEMINI_API_KEY=<your-key>`。

### 构建与预览

```bash
npm run build
npm run preview
```

构建结果位于 `dist/` 目录，可直接部署到任意静态托管平台。

## 常见问题

| 问题 | 解决方案 |
| --- | --- |
| 页面空白 | 确认 `npm run dev` 在运行，并检查 `index.html` 是否引入 `<script type="module" src="/index.tsx"></script>`，最后强制刷新。 |
| 端口占用 | Vite 会自动改用 3001+；也可在 `vite.config.ts` 修改默认端口。 |
| API 报错 | 检查 Base URL / 模型 / Key 是否正确，并使用“测试连接”确认。 |

## 许可证

本项目基于 [MIT License](./LICENSE) 开源，欢迎在遵守条款的前提下自由使用与分发。
