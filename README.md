<div align="center">
<img width="1200" height="475" alt="Bilingual Sync Editor" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Sync Editor Pro

Sync Editor Pro 是一款面向英文论文/文档的「双语同步编辑器」，支持导入 Word/Markdown、并排显示中英文段落，提供批量翻译、句子级编辑与撤销、工程导入导出、暗色主题等能力。用户可以在界面内配置自己的模型地址和 API Key，因此无需在仓库中写死任何密钥即可直接运行。

## ✨ 主要特性

- **文档导入与分段**：支持 `.docx / .md / .txt`，自动拆分段落与句子。
- **双语同步编辑**：每个句子对应一行，支持手动修改、句内同步、合并/拆分等结构调整。
- **批量与单句翻译**：并发调用 Gemini 模型（或任意兼容 OpenAI Chat Completions 的接口）。
- **自定义翻译风格**：可配置并保存多个 Prompt 风格，支持本地缓存。
- **历史撤销系统**：完整的段落快照与智能编辑锁，快捷键 `Ctrl+Z` 即可恢复。
- **工程导入导出**：一键打包当前翻译、原文及配置，方便切换设备继续工作。
- **个性化 API 配置**：在 UI 中填写 Base URL、模型名称、API Key，并测试连通性，无需预置环境变量。

## 🧱 技术栈

- [Vite 6](https://vitejs.dev/)
- [React 19](https://react.dev/)
- TypeScript
- TailwindCSS（CDN 版本） + 自定义样式
- Google Gemini SDK / 自定义 OpenAI 兼容接口

## 📦 环境要求

- Node.js 18+
- npm（随 Node 安装）

> 项目默认使用 Vite 的 `.env` 机制读取 `GEMINI_API_KEY`，但只是作为兜底。日常使用推荐直接在 UI 内输入 API 信息。

## 🚀 安装与启动

```bash
git clone <repo>
cd Sync-Editor-Pro
npm install

# 开发模式（默认 3000 端口，如被占用会自动切换）
npm run dev
```

启动后访问终端输出的地址（例如 `http://localhost:3000/` 或 `http://localhost:3001/`）。首次进入界面时页面为空，按照提示上传文档或导入工程即可开始使用。

### API 配置

1. 点击右上角齿轮按钮打开 **API & 模型配置** 面板。
2. 根据自己的服务填写：
   - **Base URL**：例如 `https://api.juheai.top/v1`（可留空，表示使用官方 Gemini SDK）。
   - **Model**：如 `gemini-3-flash-preview` 或自定义模型名称。
   - **API Key**：填写你的密钥，保存在本地 `localStorage` 中。
3. 点击「测试连接」验证可用性后再保存。配置保存后所有翻译调用都会使用你提供的参数。

> 若仍希望在命令行层面设置默认密钥，可在 `.env.local` 中添加 `GEMINI_API_KEY=<your-key>`，Vite 会自动注入为 `process.env.API_KEY`。

### 构建与预览

```bash
# 生产构建
npm run build

# 本地预览打包产物
npm run preview
```

构建输出位于 `dist/` 目录，可直接部署到任意静态资源托管平台。

## 🧰 常见问题

| 问题 | 解决方案 |
| --- | --- |
| 浏览器白屏 | 确认 `npm run dev` 正在运行，且 `index.html` 中通过 `<script type="module" src="/index.tsx"></script>` 正确加载入口。强制刷新 (Ctrl+Shift+R)。 |
| 端口被占用 | Vite 会自动切换到 `3001+`，按终端提示访问即可；或自行在 `vite.config.ts` 修改默认端口。 |
| API 调用失败 | 检查 UI 中的 Base URL、模型名和 Key 是否正确，必要时在日志/控制台查看报错。 |

## 📄 许可

当前项目未明确指定 License，如需公开分发请先与作者确认或补充许可证说明。
