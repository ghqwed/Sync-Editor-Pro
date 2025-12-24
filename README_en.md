<div align="center">
  <img width="1200" height="475" alt="Bilingual Sync Editor" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

<p align="center">
  <a href="./README.md">中文版本</a> ｜ <strong>English Version</strong>
</p>

# Sync Editor Pro

Sync Editor Pro is a bilingual workspace for long-form English documents. Import Word/Markdown files, split them into aligned sentences, translate in bulk or per sentence, and keep edits synchronized with a full undo history. API credentials live inside the UI so each contributor can connect their own Gemini or OpenAI-compatible endpoint.

## Highlights

- **Flexible imports**: `.docx`, `.md`, `.txt` with automatic paragraph and sentence splitting.
- **Side-by-side editing**: Update either language, merge/split sentences, hover highlight, and keep both sides aligned.
- **Bulk & single translation**: Concurrent Gemini (or OpenAI-compatible) calls for entire documents or individual sentences.
- **Prompt presets**: Maintain multiple translation styles, edit them inline, and persist the set via `localStorage`.
- **Full undo stack**: Up to 50 snapshots with `Ctrl+Z`, plus edit-lock throttling to avoid noisy history.
- **Project import/export**: Zip current segments, styles, original files, and API settings to continue work on another machine.
- **In-app API settings**: Configure base URL, model name, and API key in the modal with a connectivity test button.

## Tech Stack

- Vite 6
- React 19
- TypeScript
- TailwindCSS (CDN) + custom styles
- Google Gemini SDK / OpenAI-compatible REST API

## Requirements

- Node.js 18+
- npm (bundled with Node)

> `.env.local` can hold `GEMINI_API_KEY` (mapped to `process.env.API_KEY`) but the UI configuration flow is recommended for day-to-day use.

## Getting Started

```bash
git clone <repo>
cd Sync-Editor-Pro
npm install
npm run dev
```

Open the URL printed in the terminal (defaults to `http://localhost:3000/`, automatically falls back to `3001+` if busy). The canvas starts blank—upload a document or import a saved project to begin.

### API Configuration Flow

1. Click the gear icon to open **API & Model Settings**.
2. Provide Base URL (optional), model name, and API key.
3. Press **Test Connection** to verify credentials, then save.

> Prefer environment variables? Add `GEMINI_API_KEY=<your-key>` to `.env.local`.

### Build & Preview

```bash
npm run build
npm run preview
```

Production bundles are generated in `dist/`.

## Troubleshooting

| Issue | Fix |
| --- | --- |
| White screen | Ensure `npm run dev` is running and `index.html` loads `<script type="module" src="/index.tsx"></script>`. Hard refresh with `Ctrl+Shift+R`. |
| Port conflict | Vite auto-switches to the next free port; use the URL printed in the terminal or change the default in `vite.config.ts`. |
| API errors | Re-check Base URL/model/key, run **Test Connection**, and inspect the browser console/logs. |

## License

Distributed under the [MIT License](./LICENSE).
