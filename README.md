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

## Branding / theme tokens

This repo stores runtime theme tokens in the `brand` global (fonts/colors/radius). This is meant to be populated from your design system / Figma token export so new sites share the same features/components but can swap brand styling without rewriting UI.
