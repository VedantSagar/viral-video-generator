# Viral Video Generator

A provider-agnostic MVP for making short-form YouTube video drafts. It improves retention through hooks, pacing, captions, and iteration; it does **not** guarantee virality or “unskippable” results, and it does not promise literally unlimited generation. Provider quotas, rate limits, costs, latency, moderation, and failures remain explicit.

## Architecture

The Next.js App Router serves the dashboard and server-only API routes. Typed interfaces in `src/lib/providers` separate text generation, voice, visuals, video composition, and publishing. The default local path uses deterministic mock text/voice/visual services and a local render-plan provider, so it runs without paid API keys. The SQLite store persists projects and jobs and can be upgraded to Postgres plus a worker queue for production.

OmniRoute is an adapter boundary only. Set `OMNIROUTE_BASE_URL`, `OMNIROUTE_API_KEY`, and documented deployment-specific `OMNIROUTE_TEXT_PATH`/`OMNIROUTE_VIDEO_PATH` values before implementing its official request payload. The app never invents undocumented endpoints. Runway, Luma, and Kling are selectable adapter names that return an explicit not-configured error until their official APIs are wired.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`. Enter a topic and format, generate a draft, edit it, and queue a local render job. Run `npm test`, `npm run lint`, and `npm run build` for checks.

## Admin Kaggle bridge website

The dashboard is protected by `ADMIN_PASSWORD`. The password is read only on the server and is never bundled into the browser. Successful login creates an expiring, signed, HTTP-only session cookie. Set a long random value locally; do not commit `.env`.

Configure the bridge before using **Send to Kaggle**:

```bash
cp .env.example .env
npm install
npm run dev
```

Required values:

- `ADMIN_PASSWORD`: administrator password.
- `KAGGLE_BRIDGE_URL`: base URL for the private bridge.
- `KAGGLE_BRIDGE_TOKEN`: bearer token sent server-side to the bridge.

The app sends `POST /jobs` with `{ projectId, script, captionStyle, outputs }`, where `outputs` contains `mp4` and/or `mp3`. The bridge should return `{ id, status, progress, outputs, estimate }` (it may use `jobId` or `files` instead). Status polling uses `GET /jobs/:id`; output entries are `{ type, url, name }`. The browser never receives the bridge token. YouTube upload is not implemented.

## Free local/Kaggle MP4 rendering

The dashboard's local job is intentionally safe and retryable: it stores a render plan, while the free FFmpeg command creates the actual MP4. Export the generated script as JSON with this shape:

```json
{
  "title": "Example",
  "scenes": [
    { "narration": "Your caption text.", "visualPrompt": "optional", "seconds": 5 }
  ]
}
```

Then run:

```bash
sudo apt-get update && sudo apt-get install -y ffmpeg
npm run render:local -- ./script.json ./data/rendered-video.mp4
```

On Kaggle, use `/kaggle/working` because notebook sessions are temporary:

```bash
apt-get update -y && apt-get install -y ffmpeg
npm install
npm run render:local -- ./script.json /kaggle/working/rendered-video.mp4
```

This creates a 1080x1920 vertical MP4 with timed captions over a generated background. It uses no paid API. Add only assets you created or have permission to use; the next step for richer videos is to replace the visual provider with licensed images/video and add local TTS.

Publishing is disabled by default. A future YouTube adapter will require explicit OAuth and will upload private/draft by default; it will never auto-publish publicly. The app does not bypass YouTube policies, copyright, provider safeguards, or rate limits.

## Roadmap

1. Add official provider SDK adapters, licensed asset storage, and real TTS.
2. Add visual asset inputs and local TTS to the FFmpeg composition.
3. Add a durable queue, authentication, per-user quotas, billing, moderation, and observability.
4. Add explicit YouTube OAuth confirmation, thumbnails, resumable uploads, and private/draft workflows.
