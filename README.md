<div align="center">
  <img width="1200" height="475" alt="Bilingual Sync Editor" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

<style>
.lang-container {
  margin-top: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  padding: 1.5rem;
}
.lang-switch {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.lang-switch label {
  font-weight: 600;
  cursor: pointer;
  padding: 0.35rem 1rem;
  border-radius: 999px;
  border: 1px solid #c7d2fe;
  color: #4f46e5;
  background: #eef2ff;
}
.lang-container input[type="radio"] {
  display: none;
}
.lang-panel {
  display: none;
}
#lang-en:checked ~ #panel-en,
#lang-zh:checked ~ #panel-zh {
  display: block;
}
</style>

<div class="lang-container">
  <div class="lang-switch">
    <input type="radio" id="lang-en" name="readme-lang" checked />
    <label for="lang-en">English</label>
    <input type="radio" id="lang-zh" name="readme-lang" />
    <label for="lang-zh">中文</label>
  </div>

  <section class="lang-panel" id="panel-en">

## Sync Editor Pro

Sync Editor Pro is a bilingual workspace for long-form English documents. Import Word/Markdown files, split them into aligned sentences, translate in bulk or per sentence, and keep edits synchronized with a full undo history. API credentials are configured directly inside the UI so each contributor can use their own Gemini or OpenAI-compatible endpoint.

### Highlights

- **Flexible imports**: `.docx`, `.md`, `.txt` with automatic paragraph/sentence splitting.
- **Side-by-side editing**: Update either language, merge/split sentences, hover highlight, and sync both sides automatically.
- **Bulk & single translation**: Concurrent Gemini (or OpenAI-compatible) calls for entire documents or individual sentences.
- **Prompt presets**: Manage multiple translation styles, edit inline, and persist them via `localStorage`.
- **Full undo stack**: Up to 50 snapshots with `Ctrl+Z` plus edit-lock throttling during input.
- **Project import/export**: Zip the current state (segments, styles, original file, API settings) to continue elsewhere.
- **In-app API settings**: Configure base URL, model name, and API key in the modal with a built-in connectivity test.

### Tech Stack

- Vite 6
- React 19
- TypeScript
- TailwindCSS (CDN) + custom styles
- Google Gemini SDK / OpenAI-compatible REST API

### Requirements

- Node.js 18+
- npm (bundled with Node)

> `.env.local` can hold `GEMINI_API_KEY` as a fallback (`process.env.API_KEY`), but the UI flow is preferred.

### Getting Started

```bash
git clone <repo>
cd Sync-Editor-Pro
npm install
npm run dev
```

Visit the URL printed by Vite (defaults to `http://localhost:3000/`, falls back to `3001+`). The canvas starts empty—upload a document or import a project to begin.

#### API Configuration Flow

1. Click the gear icon to open **API & Model Settings**.
2. Provide Base URL (optional), model name, and API key.
3. Use **Test Connection** to verify credentials, then save.

> Prefer env vars? Add `GEMINI_API_KEY=<your-key>` to `.env.local`.

#### Build & Preview

```bash
npm run build
npm run preview
```

Production assets live in `dist/`.

### Troubleshooting

| Issue | Fix |
| --- | --- |
| White screen | Ensure `npm run dev` is running and that `index.html` includes `<script type="module" src="/index.tsx"></script>`. Force-refresh (`Ctrl+Shift+R`). |
| Port conflict | Vite auto-switches to the next free port; use the console URL or edit `vite.config.ts`. |
| API errors | Double-check Base URL/model/key, re-run **Test Connection**, inspect browser logs. |

### License

Released under the [MIT License](./LICENSE).

  </section>

  <section class="lang-panel" id="panel-zh">

## Sync Editor Pro

Sync Editor Pro 是一款面向英文文档的双语同步编辑器，支持导入 Word/Markdown、自动拆分句子、批量或单句翻译、历史撤销以及工程导入导出。用户可在界面中配置 Base URL / Model / API Key，方便使用个人的 Gemini 或 OpenAI 兼容接口。

### 主要特性

- **文档导入与分段**：支持 `.docx / .md / .txt`，自动拆分段落与句子。
- **双语并排编辑**：任意一侧修改都会同步另一侧，支持合并/拆分句子与悬停高亮。
- **批量与单句翻译**：并发调用 Gemini 或其他 OpenAI 兼容接口。
- **翻译风格预设**：维护多套 Prompt，在 UI 中编辑并保存到 `localStorage`。
- **完整撤销系统**：最多 50 条快照，`Ctrl+Z` 快速撤回，内置编辑锁确保输入顺畅。
- **工程导入导出**：Zip 中包含段落、风格、原文件与 API 设置，跨设备继续翻译。
- **界面级 API 设置**：在设置面板填写 Base URL / Model / API Key，并一键测试连通性。

### 技术栈

- Vite 6
- React 19
- TypeScript
- TailwindCSS（CDN）+ 自定义样式
- Google Gemini SDK / OpenAI 兼容接口

### 环境要求

- Node.js 18+
- npm（随 Node 安装）

> `.env.local` 的 `GEMINI_API_KEY` 仅作为兜底；推荐直接在界面中录入密钥。

### 安装与运行

```bash
git clone <repo>
cd Sync-Editor-Pro
npm install
npm run dev
```

根据终端提示访问 `http://localhost:3000/`（若被占用会自动切换到 `3001+`）。首次进入页面为空，上传文档或导入工程即可开始。

#### API 配置步骤

1. 点击右上角齿轮打开 **API & 模型配置**。
2. 输入 Base URL（可选）、模型名称、API Key。
3. 点击“测试连接”，成功后再保存。

> 若希望通过环境变量预置密钥，可在 `.env.local` 写入 `GEMINI_API_KEY=<your-key>`。

#### 构建与预览

```bash
npm run build
npm run preview
```

构建结果位于 `dist/` 目录，可直接部署到静态托管。

### 常见问题

| 问题 | 解决方案 |
| --- | --- |
| 页面空白 | 确认 `npm run dev` 在运行，并检查 `index.html` 是否引入 `<script type="module" src="/index.tsx"></script>`，最后强制刷新。 |
| 端口占用 | Vite 会自动改用 3001+；也可在 `vite.config.ts` 修改默认端口。 |
| API 报错 | 检查 Base URL / 模型 / Key 是否正确，并使用“测试连接”确认。 |

### 许可证

本项目基于 [MIT License](./LICENSE) 开源，欢迎遵循条款自由使用与分发。

  </section>
</div>
