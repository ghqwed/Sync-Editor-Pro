<div align="center">
<img width="1200" height="475" alt="Bilingual Sync Editor" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

<p align="center">
  <a href="#english-version">English Version</a> ｜ <a href="#中文介绍">中文介绍</a>
</p>

# Sync Editor Pro

## English Version

Sync Editor Pro is a bilingual workspace tailored for long-form English documents. Import Word/Markdown files, split them into aligned sentences, trigger bulk or single-sentence translations, and keep edits synchronized across languages with a full undo stack. API credentials are configured inside the UI, so every user can attach their own Gemini or OpenAI-compatible endpoint without touching repo secrets.

### Highlights

- **Flexible imports**: `.docx`, `.md`, and `.txt` with automatic paragraph/sentence splitting.
- **Side-by-side editing**: Modify either language, sync updates automatically, and merge/split sentences when needed.
- **Bulk & single translation**: Run concurrent Gemini calls (or any OpenAI-compatible API) across whole documents or specific sentences.
- **Custom style presets**: Maintain multiple translation prompts, edit them inline, and persist them in `localStorage`.
- **Full undo history**: Snapshot up to 50 states, use `Ctrl+Z`, and benefit from lock-based debouncing while typing.
- **Project import/export**: Zip current segments, styles, original files, and API settings to continue on another machine.
- **In-app API configuration**: Base URL, model name, and API key are editable in the settings modal with a connection test button.

### Tech Stack

- [Vite 6](https://vitejs.dev/)
- [React 19](https://react.dev/)
- TypeScript
- TailwindCSS (CDN) + custom styles
- Google Gemini SDK / OpenAI-compatible REST API

### Requirements

- Node.js 18+
- npm (bundled with Node)

> `.env.local` can hold `GEMINI_API_KEY` as a fallback (`process.env.API_KEY`), but the recommended workflow is to enter credentials in the UI.

### Getting Started

```bash
git clone <repo>
cd Sync-Editor-Pro
npm install

# starts the dev server (defaults to 3000; switches to 3001+ if busy)
npm run dev
```

Open the terminal URL (e.g., `http://localhost:3000/`). The canvas starts empty—upload a document or import an existing project to begin.

#### API Configuration Flow

1. Click the gear icon in the header to open **API & Model Settings**.
2. Enter:
   - **Base URL** (optional): e.g., `https://api.juheai.top/v1` if using an OpenAI-compatible service.
   - **Model**: e.g., `gemini-3-flash-preview`.
   - **API Key**: stored only in the browser.
3. Press **Test Connection** to verify the provider, then save. All translation requests reuse these settings.

#### Build & Preview

```bash
npm run build
npm run preview
```

Artifacts live in `dist/` and can be deployed to any static host.

### Troubleshooting

| Issue | Fix |
| --- | --- |
| Blank screen | Ensure `npm run dev` is running and that `index.html` includes `<script type="module" src="/index.tsx"></script>`. Force-refresh (`Ctrl+Shift+R`). |
| Port conflict | Vite automatically bumps to the next free port (3001+). Use the URL printed in the console or change the default in `vite.config.ts`. |
| API failures | Double-check Base URL/model/key, then re-run **Test Connection** and inspect the browser console/logs. |

### License

Distributed under the [MIT License](./LICENSE).

---

## 中文介绍

Sync Editor Pro 是面向英文文档的双语同步编辑器。它支持导入 Word/Markdown 文件、自动拆分句子、批量或单句翻译、历史撤销、工程导入导出等能力。所有模型配置都在界面中完成，因此每位用户都可以使用自己的 Gemini 或 OpenAI 兼容接口。

### 主要特性

- **文档导入与分段**：支持 `.docx / .md / .txt`，自动拆分段落和句子。
- **双语并排编辑**：任意一侧的修改都会同步另一侧，可合并/拆分句子、悬停高亮。
- **批量与单句翻译**：并发调用 Gemini 或其他 OpenAI 兼容接口。
- **自定义翻译风格**：在 UI 中维护多套 Prompt，可实时编辑并保存到本地。
- **完整撤销系统**：最多 50 条历史快照，`Ctrl+Z` 快速撤回，内置编辑锁确保录入顺畅。
- **工程导入导出**：打包当前段落、样式、原文件、API 设置，跨设备继续翻译。
- **界面级 API 设置**：Base URL / Model / API Key 全部在设置面板中填写，并可测试连通性。

### 技术栈

- Vite 6
- React 19
- TypeScript
- TailwindCSS（CDN）+ 自定义样式
- Google Gemini SDK / OpenAI 兼容接口

### 环境要求

- Node.js 18+
- npm（随 Node 安装）

> `.env.local` 中的 `GEMINI_API_KEY` 仅作为兜底；推荐直接在界面中录入密钥，方便个人化使用。

### 安装与运行

```bash
git clone <repo>
cd Sync-Editor-Pro
npm install
npm run dev
```

根据终端输出访问 `http://localhost:3000/`（若端口被占用会自动切换到 3001+）。首次进入页面为空，按照提示上传文档或导入项目即可开始。

#### API 配置步骤

1. 点击右上角齿轮按钮，打开 **API & 模型配置**。
2. 输入 Base URL（可选）、模型名称以及 API Key。
3. 点击“测试连接”确认可用，再保存配置。之后的所有翻译都会使用该设置。

#### 构建与预览

```bash
npm run build
npm run preview
```

构建结果位于 `dist/` 目录，可部署到任意静态托管平台。

### 常见问题

| 问题 | 解决方案 |
| --- | --- |
| 页面空白 | 确保 `npm run dev` 在运行，并强制刷新；若仍无内容，检查 `index.html` 是否引入 `/index.tsx`。 |
| 端口被占用 | Vite 会自动改用 3001+，按终端提示访问即可，或在 `vite.config.ts` 自行修改端口。 |
| API 报错 | 检查 Base URL / 模型 / Key 是否填写正确，并使用“测试连接”确认。 |

### 许可证

本项目使用 [MIT License](./LICENSE) 开源，欢迎在遵守条款的前提下自由使用与分发。
