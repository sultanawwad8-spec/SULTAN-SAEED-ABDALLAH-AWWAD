<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1MJsCx_qiTc8eXvPka2SvZmh9bIhtRvaf

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Architecture & Deployment Blueprint

- **Front-end**: React + Vite with Tailwind-style utility classes. UI organized into a configuration panel, script/question preview, audio player/export actions, and a history feed.
- **AI/Audio APIs**: Google Gemini 2.5 Flash for text/MCQ generation and Gemini 2.5 Flash Preview TTS for audio. The client provides prompts that include level, word count, accents, pauses, tone, and speed guidance.
- **State & Persistence**: React state for the active session; lightweight history stored in `localStorage` (latest 10 items) with download URLs for audio exports.
- **Key Components**:
  - `ControlPanel` – collects all script/audio parameters (topic, type, level, word count, speakers, tone, accents, pauses, duration, etc.).
  - `ScriptDisplay` – edits/exports the generated script (TXT/DOCX) and triggers TTS.
  - `QuestionsDisplay` – MCQ/answer-key view and regeneration control.
  - `AudioPlayer` – playback plus WAV/MP3(WebM) export and transcript save.
  - `HistoryList` – shows recent generations and download links.
- **Database option**: For server-side persistence, store history rows with `{id, topic, level, type, parameters JSON, script text, audio URLs, created_at}`. Any SQL/NoSQL table keyed by `id` will work; the UI currently uses localStorage for simplicity.

### APIs required
- `@google/genai` text endpoint: `gemini-2.5-flash` for script/MCQ creation.
- `@google/genai` TTS endpoint: `gemini-2.5-flash-preview-tts` with `speechConfig` for single or multi-speaker voices.

### UI layout
- Header with step menus (Generate New Audio → Choose Type → Set Parameters → Preview Script → Generate Audio → Download Section → History).
- Left column: configuration form (content + audio parameters).
- Right column: script/questions tabs, audio player/export controls, and the history list.

### Backend logic (client-side in this repo)
1. Build a rich prompt from the form inputs (level, word count, purpose, tone, accents, pauses, etc.).
2. Call Gemini text model for the script; optionally call it again for MCQs with answer keys.
3. Call Gemini TTS with multi-speaker voice config, pause guidance, speed, and accent hints.
4. Decode audio into an `AudioBuffer` for playback; expose WAV/MP3(WebM) downloads and transcript export.

### Deployment steps
1. Set `GEMINI_API_KEY` (or `API_KEY`) in the hosting environment.
2. `npm install` then `npm run build` to produce the `dist/` bundle.
3. Deploy the static `dist/` folder to any CDN/static host (e.g., Cloudflare Pages, Netlify, Vercel static export).
4. Ensure the host injects the API key as an env var accessible to the Vite client runtime.

### Recommended libraries
- `@google/genai` for both text generation and TTS.
- Native `MediaRecorder` for MP3/WebM export, plus in-app WAV encoding for compatibility.
