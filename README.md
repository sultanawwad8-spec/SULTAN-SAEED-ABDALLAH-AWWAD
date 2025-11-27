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

## App Architecture

- **Frontend**: React + Vite single-page interface with dedicated panels for configuration, preview, downloads, and history.
- **Services**: `services/geminiService.ts` wraps Gemini text + TTS endpoints for script, MCQ, and audio generation.
- **State**: Managed in `App.tsx`, including exam configuration, script, questions, audio buffers, and a local history list of generated audios.
- **Utilities**: Audio helpers for decoding PCM, WAV/MP3 export, and text/Docx-like downloads.

### API Usage
- **Text Generation**: `gemini-2.5-flash` for scripts and MCQs with JSON schema enforcement for question objects.
- **Text-to-Speech**: `gemini-2.5-flash-preview-tts` with multi-speaker voice configs, speed, tone, and pause controls.

### UI Layout & Menus
- Header callouts enumerate the required menus: Generate New Audio, Choose Type, Set Parameters, Preview Script, Generate Audio, Download Section, and History of Generated Audios.
- Left column: Control Panel for script/audio parameters and the history list.
- Right column: Tabs for script preview/downloads and MC questions, plus an audio player for immediate playback.

### Backend Logic (in the browser)
- Script prompt construction honors topic, level, target word count, purpose, tone, vocabulary/sentence complexity, pause style, target duration, and speaker labeling.
- Audio prompt construction applies tone/emotion, pause notes, target duration, and accent/style metadata for each speaker voice.
- Question generation returns five MCQs with an answer key when requested.

### Data & Persistence
- Lightweight history is stored in memory during the session (no external database) and captures script, config snapshot, questions, and audio buffer for quick reloads.

### Recommended Libraries & Frameworks
- **React + Vite** for fast UI development.
- **@google/genai** for Gemini text and TTS.
- Native browser `MediaRecorder` + Web Audio API for WAV/MP3 exporting without extra codecs.

### Deployment
1. Create `.env` or `.env.local` with `VITE_GEMINI_API_KEY` (or `GEMINI_API_KEY`).
2. Install dependencies: `npm install` (or use a private npm mirror if direct registry access is restricted).
3. Build for production: `npm run build`.
4. Serve `dist/` with any static host (Vercel, Netlify, Cloudflare Pages, or an S3/CloudFront bucket).
