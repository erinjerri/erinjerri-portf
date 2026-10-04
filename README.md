# freshest-portf-26

Payload CMS + Next.js site intended to be used as a reusable “starter/template”:
- Same collections/blocks/components each time
- Seed content (pages/posts/media/globals) included in-repo
- Deployable to Netlify

## References

Payload setup/tutorial links:

- Cloudflare + Payload video: https://www.youtube.com/watch?v=8jPNsLX7XGg
- Payload DB + file storage video: https://www.youtube.com/watch?v=-0CCUkoBDSY&t=692s
- Payload + Supabase video: https://www.youtube.com/watch?v=L5w2QYB9-UU&t=161s

## Technology Stack

This template uses:
- **Next.js 15** + **React 19** for frontend
- **Payload CMS 3.78** for headless content management
- **MongoDB** for database
- **Tailwind CSS** for styling
- **TypeScript** for type safety
- **Playwright** + **Vitest** for testing
- **AWS S3** / **Cloudflare** for media storage

See [docs/TECH_STACK.md](docs/TECH_STACK.md) for complete dependency list.

## Documentation

Detailed guides for specific features:
- **[BLOCKS.md](docs/BLOCKS.md)** — Available page layout blocks and components
- **[R2_SETUP.md](docs/R2_SETUP.md)** — Cloudflare R2 media storage configuration
- **[TECH_STACK.md](docs/TECH_STACK.md)** — Complete technology dependencies and versions

## Setup Tutorials

Helpful video guides for Payload CMS + Next.js setup:
- [Cloudflare + Payload](https://www.youtube.com/watch?v=8jPNsLX7XGg) — Storage and deployment on Cloudflare
- [Payload DB + File Storage](https://www.youtube.com/watch?v=-0CCUkoBDSY&t=692s) — Database and media configuration
- [Payload + Supabase](https://www.youtube.com/watch?v=L5w2QYB9-UU&t=161s) — Alternative database setup

## Prerequisites

- **Node.js:** ^18.20.2 or >=20.9.0
- **pnpm:** ^9 or ^10 (package manager)
- **MongoDB:** Atlas cluster or local instance
- **Git:** for version control

## Use as a template (GitHub + Netlify)

1. In GitHub, click **Use this template** (or fork).
2. **Clone locally:**
   ```bash
   git clone https://github.com/your-username/repo-name.git
   cd repo-name
   ```
3. **Install dependencies:**
   ```bash
   pnpm install
   ```
4. **Set up environment variables** (create `.env.local`):
   ```bash
   PAYLOAD_SECRET=your-secret-key-here
   DATABASE_URL=mongodb+srv://user:password@cluster.mongodb.net/dbname
   NEXT_PUBLIC_SERVER_URL=http://localhost:3000
   ```
5. **Run locally:**
   ```bash
   pnpm dev
   ```
   - Admin: http://localhost:3000/admin
   - Seed data: Click "Seed your database" from admin dashboard
6. **Deploy to Netlify:**
   - Connect your GitHub repo to Netlify
   - Set environment variables in Netlify dashboard
   - Deploy
7. **Post-deployment setup:**
   - Open `/admin` on your deployed site
   - Login with seeded credentials
   - Configure media storage (S3, Cloudflare, etc.)

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
   - `SUBSTACK_SYNC_ENABLED` (optional; defaults to enabled unless explicitly `false`)
   - `SUBSTACK_RSS_URL` (optional)
   - `SUBSTACK_SYNC_MODE` (optional)
   - `SUBSTACK_SYNC_NOTIFY_EMAIL` (optional)
   - `SUBSTACK_SYNC_DOWNLOAD_IMAGES` (optional)
   - `SUBSTACK_SYNC_FORCE_UPDATE` (optional)
   - `SUBSTACK_SYNC_ALWAYS_FETCH_FULL_ARTICLE` (optional; `false` is recommended for cron speed)
   - `SUBSTACK_SYNC_DISCOVER_FROM_ARCHIVE` (optional; `false` is recommended for cron speed)
   - `SUBSTACK_SYNC_CRON` (optional; default `0 0 * * * *`) — used by Payload’s job **schedule** in config; on Netlify you still need a runner (below).
   - `SUBSTACK_SYNC_QUEUE` (optional; default `substack`)
   - `CRON_SECRET` (required for any automated trigger: Netlify scheduler or external cron)

2. **Netlify:** with `CRON_SECRET` set, the scheduled function `netlify/functions/substack-sync-cron.ts` runs **hourly** and `POST`s `/next/sync-substack` (same as manual cron). It forwards `x-substack-sync-mode` (`auto_publish` by default, or `review` if `SUBSTACK_SYNC_MODE=review`). Set `SUBSTACK_SYNC_ENABLED=false` to disable. The separate `schedule-publish` function only drains the `schedulePublish` queue — it does **not** import Substack by itself.

3. **Other hosts / extra triggers:** use an external cron (cron-job.org, UptimeRobot, etc.) calling:
   - `POST https://your-site/next/sync-substack`
   - header: `Authorization: Bearer $CRON_SECRET`
   - optional header: `x-substack-sync-profile: fast` (defaults to `fast` for cron-secret requests)

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
