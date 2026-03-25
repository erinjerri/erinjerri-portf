# freshest-portf-26

Payload CMS + Next.js site intended to be used as a reusable “starter/template”:
- Same collections/blocks/components each time
- Seed content (pages/posts/media/globals) included in-repo
- Deployable to Netlify

## Use as a template (GitHub + Netlify)

1. In GitHub, click **Use this template** (or fork).
2. In Netlify, create a new site from the repo and set environment variables:
   - `PAYLOAD_SECRET`
   - `DATABASE_URL` (MongoDB connection string)
   - `NEXT_PUBLIC_SERVER_URL` (your site URL)
   - Optional: `EMAIL_VERIFY_TRANSPORT=true` to enable SMTP verification on startup
3. Deploy, then open `/admin`, login, and click **Seed your database** from the dashboard.

### Seeding in production (recommended flow)

The admin “Seed your database” button hits `POST /next/seed`.
- In production this route returns 404 unless `ALLOW_SEED_IN_PROD=true`.
- It also requires you to be logged into the admin (403 if not authenticated).

Suggested workflow:
1. Temporarily set `ALLOW_SEED_IN_PROD=true` in Netlify
2. Seed once from the admin dashboard
3. Remove `ALLOW_SEED_IN_PROD` (or set it back to `false`)

## Local development

- `pnpm dev`
- `pnpm seed` (runs `src/scripts/restore.ts` to seed locally; uses `DATABASE_URL`)

## Substack cross-post sync (auto-import)

This repo can import your Substack posts (via RSS) into the `posts` collection as either:
- **Drafts for review** (default): `_status=draft`, `crosspostReviewStatus=in_review`, and an optional email notification
- **Auto-published**: `_status=published`, `crosspostReviewStatus=auto_published`

### One-time import (past posts)

- `pnpm sync:substack`

Optional env vars:
- `SUBSTACK_RSS_URL` (default: `https://erinjerri.substack.com/feed`)
- `SUBSTACK_SYNC_MODE` (`review` or `auto_publish`)
- `SUBSTACK_SYNC_NOTIFY_EMAIL` (send a summary email when new posts are imported)
- `SUBSTACK_DEFAULT_AUTHOR_ID` or `SUBSTACK_DEFAULT_AUTHOR_EMAIL` (set `posts.authors`)
- `SUBSTACK_SYNC_MAX_ITEMS` (cap items processed per run)
- `SUBSTACK_SYNC_FORCE_UPDATE=true` (re-fetch full article and update existing synced posts)
- `SUBSTACK_SYNC_DOWNLOAD_IMAGES=true` (download Substack images into `media` and embed them)
- `SUBSTACK_SYNC_MAX_IMAGES_PER_POST` (cap images imported per post; default 25)

### Automated (scheduled) sync

1. Set environment variables:
   - `SUBSTACK_SYNC_ENABLED=true`
   - `SUBSTACK_RSS_URL` (optional)
   - `SUBSTACK_SYNC_MODE` (optional)
   - `SUBSTACK_SYNC_NOTIFY_EMAIL` (optional)
   - `SUBSTACK_SYNC_DOWNLOAD_IMAGES` (optional)
   - `SUBSTACK_SYNC_FORCE_UPDATE` (optional)
   - `SUBSTACK_SYNC_CRON` (optional; default `0 0 * * * *`) — used by Payload’s job **schedule** in config; on Netlify you still need a runner (below).
   - `SUBSTACK_SYNC_QUEUE` (optional; default `substack`)
   - `CRON_SECRET` (required for any automated trigger: Netlify scheduler or external cron)

2. **Netlify:** with `SUBSTACK_SYNC_ENABLED=true` and `CRON_SECRET` set, the scheduled function `netlify/functions/substack-sync-cron.ts` runs **hourly** and `POST`s `/next/sync-substack` (same as manual cron). The separate `schedule-publish` function only drains the `schedulePublish` queue — it does **not** import Substack by itself.

3. **Other hosts / extra triggers:** use an external cron (cron-job.org, UptimeRobot, etc.) calling:
   - `POST https://your-site/next/sync-substack`
   - header: `Authorization: Bearer $CRON_SECRET`

## Medium cross-post sync

Import Medium posts (via RSS) into the `posts` collection. Same modes as Substack: **review** (drafts) or **auto_publish**.

### One-time import

- `pnpm sync:medium`

Requires: `DATABASE_URL` (or `MONGODB_URI`) and `PAYLOAD_SECRET` in `.env`.

Optional env vars:
- `MEDIUM_RSS_URL` (default: `https://medium.com/feed/@erinjerri`)
- `MEDIUM_SYNC_MODE` (`review` or `auto_publish`) — use `auto_publish` if you want posts to show on `/posts` immediately
- `MEDIUM_SYNC_DOWNLOAD_IMAGES=true` (import images into Media)
- `MEDIUM_SYNC_MAX_ITEMS`, `MEDIUM_SYNC_FORCE_UPDATE`, etc.

### Automated sync

- `MEDIUM_SYNC_ENABLED=true`
- `MEDIUM_RSS_URL`, `MEDIUM_SYNC_MODE`, etc. (see `.env.example`)
- Trigger: `POST /next/sync-content` with header `Authorization: Bearer $CRON_SECRET`

## Paragraph cross-post sync

Import Paragraph posts into the `posts` collection. Same modes as Substack.

### One-time import

- `pnpm sync:paragraph`

Optional env vars:
- `PARAGRAPH_PUBLICATION` (default: `@cypherpinay`) — slug or full publication URL
- `PARAGRAPH_SYNC_MODE` (`review` or `auto_publish`)
- `PARAGRAPH_SYNC_DOWNLOAD_IMAGES=true`, etc.

### Automated sync

- `PARAGRAPH_SYNC_ENABLED=true`
- Trigger: `POST /next/sync-content` with header `Authorization: Bearer $CRON_SECRET`

## Branding / theme tokens

This repo stores runtime theme tokens in the `brand` global (fonts/colors/radius). This is meant to be populated from your design system / Figma token export so new sites share the same features/components but can swap brand styling without rewriting UI.
