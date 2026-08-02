# Local Installation & Development Setup

This guide covers local development setup. For production deployment, see [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md).

This guide assumes little or no prior Payload experience.

## 1. Install the required software

Install:

- Git
- Node.js 20.19 or newer (Node 22.12+ recommended)
- Docker Desktop if you want local MongoDB

Confirm the tools:

```bash
git --version
node --version
corepack --version
```

Enable the project’s package manager:

```bash
corepack enable
corepack prepare pnpm@10.23.0 --activate
pnpm --version
```

If Corepack is unavailable, install pnpm with:

```bash
npm install --global pnpm@10.23.0
```

## 2. Create your repository

If this repository is marked as a GitHub template, select **Use this template**, create a repository
under your account, and clone that new repository.

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
cd YOUR-REPOSITORY
pnpm install
```

The lockfile is committed intentionally. Do not delete it during normal setup.

## 3. Create the environment file

```bash
cp .env.example .env
```

Required local variables:

```env
DATABASE_URL=mongodb://127.0.0.1:27017/payload-portfolio
PAYLOAD_SECRET=replace-with-a-random-secret
PREVIEW_SECRET=replace-with-a-different-random-secret
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_OWNER_NAME=Your Name
```

Generate secrets:

```bash
openssl rand -base64 32
```

Run the command separately for each secret. Do not reuse production secrets between projects.

## 4. Choose a MongoDB option

### Option A: Docker

```bash
docker compose up -d mongo
docker compose ps
```

Stop it later with:

```bash
docker compose stop mongo
```

### Option B: MongoDB Atlas

1. Create an Atlas project and cluster.
2. Create a database user with a unique password.
3. Add your current IP address to Network Access.
4. Copy the application connection string.
5. Replace `DATABASE_URL` in `.env`.
6. URL-encode special characters in the database password.

Use a separate database for local development and production.

## 5. Seed starter content

For an empty database, add an initial administrator to `.env`:

```env
RESTORE_ADMIN_EMAIL=you@example.com
RESTORE_ADMIN_PASSWORD=use-a-unique-long-password
```

Then run:

```bash
pnpm seed
```

The seed creates:

- An administrator
- Generic home, about, contact, and speaking pages
- Generic posts, categories, and media
- Header, footer, and brand globals
- Contact and speaking forms

The command stops without changing data when the database is not empty. Setting
`RESTORE_FORCE=true` intentionally deletes and reseeds starter collections.

## 6. Start the application

```bash
pnpm dev
```

Open:

- `http://localhost:3000`
- `http://localhost:3000/admin`

Sign in with `RESTORE_ADMIN_EMAIL` and `RESTORE_ADMIN_PASSWORD`.

## 7. Content Model Overview

### Editable in the CMS

- **Pages:** Home, about, contact, custom pages (heroes, blocks, SEO metadata)
- **Posts:** Blog posts (native or imported from Substack/Medium/Paragraph)
- **Projects:** Portfolio work showcase
- **Watch:** Curated video/media collections
- **Poetry:** Published poetry (optional)
- **Media:** Images, videos, documents (metadata in MongoDB, files in R2 or local storage)
- **Globals:** Header, footer, brand configuration
- **Categories:** Tags for posts and projects
- **Forms:** Contact, speaking request (configured via page blocks)

See [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md#part-1-content-model-overview) for complete details.

### Hard-Coded or Environment-Driven

- **Site identity:** `NEXT_PUBLIC_SITE_OWNER_NAME`, `NEXT_PUBLIC_SITE_TITLE`, etc.
- **Routes:** `/admin`, `/posts`, `/projects`, `/search`, `/poetry`
- **Third-party integrations:** Substack, Medium, Paragraph URLs
- **Analytics:** Google Analytics, Microsoft Clarity (via env vars)

## 8. Payload Architecture

Payload is embedded in Next.js:

- `src/payload.config.ts` registers collections, globals, plugins, jobs, and admin components.
- `src/collections/` contains content schemas (Pages, Posts, Projects, etc.).
- `src/blocks/` contains reusable page-builder blocks.
- `src/Header/` and `src/Footer/` contain global navigation configuration.
- `src/app/(payload)/` exposes Payload admin UI and API routes.
- `src/app/(frontend)/` contains public Next.js routes.
- `src/endpoints/seed/` contains starter content for seeding.

### When Schema Changes

After modifying collections or globals:

```bash
pnpm generate:types
pnpm generate:importmap
pnpm exec tsc --noEmit
```

Commit `src/payload-types.ts` and `src/app/(payload)/admin/importMap.js` when they change.

## Troubleshooting

### Port 3000 is busy

```bash
lsof -ti :3000
```

Stop the process or start Next.js on another port:

```bash
pnpm dev -- --port 3001
```

### MongoDB connection refused

```bash
docker compose ps
docker compose logs mongo
```

Confirm `DATABASE_URL` uses `127.0.0.1`, not the Docker service name, when Next.js runs directly on
your computer.

### Payload secret error

Confirm `.env` contains a non-empty `PAYLOAD_SECRET`, then restart `pnpm dev`.

### Admin import error

```bash
pnpm generate:importmap
pnpm dev:clean
pnpm dev
```

### Types do not match a changed field

```bash
pnpm generate:types
pnpm exec tsc --noEmit
```
