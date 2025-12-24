<div align="center">
<img width="1200" height="475" alt="Bilingual Sync Editor" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

<div align="center">
<b>Language ｜ 语言：</b>
<button onclick="document.getElementById('lang-en').open = true; document.getElementById('lang-zh').open = false;">English</button>
<button onclick="document.getElementById('lang-zh').open = true; document.getElementById('lang-en').open = false;">中文</button>
<br/>
<sub>(GitHub README 不支持脚本执行，若按钮不可用，请手动展开下方 <code>&lt;details&gt;</code> 切换语言)</sub>
</div>

---

<details id="lang-en" open>
<summary><strong>English Version</strong></summary>

## Sync Editor Pro

Sync Editor Pro is a bilingual workspace for long-form English documents. Import Word/Markdown files, split them into aligned sentences, translate in bulk or sentence-by-sentence, and keep edits synchronized with a full undo history. API credentials are configured directly inside the UI so every contributor can use their own Gemini or OpenAI-compatible endpoint.

### Highlights

- **Flexible imports**: `.docx`, `.md`, `.txt` with automatic paragraph and sentence splitting.
- **Side-by-side editing**: Update either language with live sync, merge/split sentences, and highlight hovered pairs.
- **Bulk & single translation**: Concurrent Gemini (or OpenAI-compatible) requests across the whole document or a single sentence.
- **Prompt presets**: Maintain multiple style prompts, edit them inline, and persist them via `localStorage`.
- **Full undo stack**: Up to 50 snapshots with `Ctrl+Z`, plus an edit-lock debouncer.
- **Project import/export**: Zip segments, styles, original files, and API settings to continue work anywhere.
- **In-app API settings**: Configure base URL, model name, and API key inside the settings modal with a connectivity test.

### Tech Stack

- Vite 6
- React 19
- TypeScript
- TailwindCSS (CDN) + custom styling
- Google Gemini SDK / OpenAI-compatible REST endpoints

### Requirements

- Node.js 18+
- npm (bundled with Node)

> `.env.local` can hold `GEMINI_API_KEY` as a fallback (`process.env.API_KEY`), but the recommended approach is configuring credentials in the UI.

### Getting Started

```bash
git clone <repo>
cd Sync-Editor-Pro
npm install
npm run dev
```

Visit the URL from the terminal (defaults to `http://localhost:3000/`, falls back to `3001+`). The canvas is blank until you upload a document or import a project.

#### API Configuration Flow

1. Click the gear icon to open **API & Model Settings**.
2. Fill in Base URL (optional), model name, and API key.
3. Hit **Test Connection**, then save. All translation requests reuse these settings.

> Prefer environment variables? Add `GEMINI_API_KEY=<your-key>` to `.env.local`.

#### Build & Preview

```bash
npm run build
npm run preview
```

The production bundle lives in `dist/`.

### Troubleshooting

| Issue | Fix |
| --- | --- |
| White screen | Ensure `npm run dev` runs and that `<script type="module" src="/index.tsx"></script>` exists. Force-refresh. |
| Port conflict | Vite auto-selects the next free port; use the printed URL or change the port in `vite.config.ts`. |
| API errors | Double-check Base URL/model/key, re-run **Test Connection**, inspect browser console. |

### License

Released under the [MIT License](./LICENSE).

</details>

---

<details id="lang-zh">
<summary><strong>中文介绍</strong></summary>

## Sync Editor Pro

Sync Editor Pro 是一款面向英文文档的双语同步编辑器，支持导入 Word/Markdown、自动拆分句子、批量或单句翻译、历史撤销以及工程导入导出。所有模型参数都在界面中配置，方便每位用户使用自己的 Gemini 或 OpenAI 兼容接口。

### 主要特性

- **文档导入与分段**：`.docx / .md / .txt` 自动拆分段落与句子。
- **双语并排编辑**：任意一侧修改都会同步另一侧，可合并/拆分句子并高亮当前行。
- **批量与单句翻译**：并发调用 Gemini 或其他 OpenAI 兼容接口。
- **翻译风格预设**：维护多套 Prompt，在 UI 中编辑并保存到 `localStorage`。
- **完整撤销系统**：最多 50 条历史快照，支持 `Ctrl+Z` 以及智能编辑锁。
- **工程导入导出**：Zip 包含段落、风格、原文件、API 配置，跨设备继续翻译。
- **界面级 API 设置**：在设置面板填写 Base URL / Model / API Key，并内置连通性测试。

### 技术栈

- Vite 6
- React 19
- TypeScript
- TailwindCSS（CDN）+ 自定义样式
- Google Gemini SDK / OpenAI 兼容接口

### 环境要求

- Node.js 18+
- npm（随 Node 安装）

> `.env.local` 中的 `GEMINI_API_KEY` 仅作为兜底，日常使用推荐走 UI 配置。

### 安装与运行

```bash
git clone <repo>
cd Sync-Editor-Pro
npm install
npm run dev
```

根据终端提示访问 `http://localhost:3000/`（端口被占用时会切到 `3001+`）。首次进入页面为空，上传文档或导入工程即可开始。

#### API 配置步骤

1. 点击右上角齿轮打开 **API & 模型配置**。
2. 输入 Base URL（可选）、模型名称、API Key。
3. 先点击“测试连接”，成功后再保存。

> 若想通过环境变量预置密钥，可在 `.env.local` 写入 `GEMINI_API_KEY=<your-key>`。

#### 构建与预览

```bash
npm run build
npm run preview
```

构建结果在 `dist/`，可直接部署到任意静态托管。

### 常见问题

| 问题 | 解决方案 |
| --- | --- |
| 页面空白 | 确保 `npm run dev` 运行并强制刷新；若仍无内容，检查 `index.html` 是否引入 `/index.tsx`。 |
| 端口占用 | Vite 会改用 3001+，按终端提示访问；或在 `vite.config.ts` 手动更改。 |
| API 报错 | 检查 Base URL / 模型 / Key 是否正确，并使用“测试连接”确认。 |

### 许可证

本项目基于 [MIT License](./LICENSE) 开源，欢迎在遵守条款的前提下自由使用与分发。

</details>
