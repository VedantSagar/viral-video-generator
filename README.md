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

Publishing is disabled by default. A future YouTube adapter will require explicit OAuth and will upload private/draft by default; it will never auto-publish publicly. The app does not bypass YouTube policies, copyright, provider safeguards, or rate limits.

## Roadmap

1. Add official provider SDK adapters, licensed asset storage, and real TTS.
2. Execute FFmpeg compositions with timed captions and object storage.
3. Add a durable queue, authentication, per-user quotas, billing, moderation, and observability.
4. Add explicit YouTube OAuth confirmation, thumbnails, resumable uploads, and private/draft workflows.
