# Deployment to Netlify

**For complete step-by-step production setup, see [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md).**

This page covers Netlify-specific deployment details. The repository includes a Netlify configuration via `netlify.toml`. The same application can be adapted to other Node-compatible hosts (Vercel, AWS, Render), but scheduled functions and media storage must be configured separately.

## Prerequisites

You need:

- A GitHub repository containing the customized starter
- A production MongoDB Atlas database
- A Netlify account
- Persistent media storage via Cloudflare R2
- A custom domain (optional during first deployment)

## 1. Create production secrets

Generate unique values:

```bash
openssl rand -base64 32
openssl rand -base64 32
openssl rand -hex 32
```

Use them for:

```env
PAYLOAD_SECRET=
PREVIEW_SECRET=
CRON_SECRET=
```

Do not reuse local secrets.

## 2. Configure MongoDB Atlas

1. Create a production cluster.
2. Create a production database user.
3. Permit connections from the hosting environment.
4. Copy the connection string into `DATABASE_URL`.
5. Keep the database name unique to this site.

Back up the database before destructive seeding or schema migrations.

## 3. Create the Netlify site

1. Choose **Add new site → Import an existing project**.
2. Select the customized GitHub repository.
3. Allow Netlify to read `netlify.toml`.
4. Do not override the build command unless required.

The included build command is:

```text
pnpm run build:netlify
```

## 4. Add required environment variables

```env
DATABASE_URL=mongodb+srv://...
PAYLOAD_SECRET=...
PREVIEW_SECRET=...
NEXT_PUBLIC_SERVER_URL=https://your-netlify-site.netlify.app
NEXT_PUBLIC_SITE_URL=https://your-netlify-site.netlify.app
NEXT_PUBLIC_SITE_OWNER_NAME=Your Name
NEXT_PUBLIC_SITE_TITLE=Your Name — Portfolio
NEXT_PUBLIC_SITE_DESCRIPTION=Your portfolio description.
ALLOW_SEED_IN_PROD=false
```

Redeploy after changing `NEXT_PUBLIC_*` values because they may be embedded into the client build.

## 5. Configure persistent media

Serverless filesystems do not preserve uploads reliably. Configure the R2 variables described in
[Media and R2](MEDIA_AND_R2.md):

```env
USE_R2_STORAGE=true
R2_ACCOUNT_ID=
R2_BUCKET=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
```

Use a separate production bucket and least-privilege credentials.

## 6. Create the first administrator and seed

Recommended approach:

1. Deploy with `ALLOW_SEED_IN_PROD=false`.
2. Open `/admin`.
3. Create the initial administrator through Payload.
4. Temporarily set `ALLOW_SEED_IN_PROD=true`.
5. Redeploy.
6. Sign in and use the dashboard seed action.
7. Immediately set `ALLOW_SEED_IN_PROD=false` and redeploy.

Seeding replaces starter collections. Never reseed after real content has been added.

## 7. Configure Substack

Add the variables from [Substack integration](SUBSTACK.md). Keep
`SUBSTACK_SYNC_MODE=review` for the first production imports.

If scheduled sync is enabled:

```env
SUBSTACK_SYNC_ENABLED=true
CRON_SECRET=...
```

Confirm the scheduled function appears in the Netlify Functions dashboard.

## 8. Connect the domain

After adding the custom domain:

```env
NEXT_PUBLIC_SERVER_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

Redeploy and verify:

- Canonical links
- Open Graph image
- `/robots.txt`
- Sitemap routes
- Payload preview URLs
- CORS behavior in the admin panel

If using a poetry subdomain:

```env
NEXT_PUBLIC_POETRY_HOSTNAME=poetry.yourdomain.com
```

Create the corresponding DNS record and add the hostname to the hosting provider.

## 9. Launch checks

```bash
pnpm generate:types
pnpm generate:importmap
pnpm exec tsc --noEmit
pnpm build
```

Then verify:

- Homepage, posts, projects, watch, poetry, and search routes
- `/admin` login
- Draft preview
- Contact and speaking forms
- Substack subscription
- Substack import in review mode
- Media upload and delivery
- Mobile navigation
- 404 page
- Social sharing preview

## Rollback

Keep database backups independent from Git. Rolling Git back does not roll Payload content back.
For a broken code deployment, redeploy the previous successful Netlify deploy. For a destructive
content change, restore the database backup and the corresponding media objects.
