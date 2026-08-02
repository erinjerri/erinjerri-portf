# Payload Portfolio Starter

A customizable portfolio, writing, projects, speaking, and newsletter starter built with
[Payload CMS](https://payloadcms.com/) and Next.js.

The starter includes:

- A Payload admin panel at `/admin`
- Editable pages, projects, posts, videos, poetry, forms, navigation, footer, and branding
- Drafts, live preview, SEO fields, redirects, search, and scheduled publishing
- Optional Substack, Medium, and Paragraph imports
- Optional Google Analytics, Microsoft Clarity, Amazon Associates, SMTP, and Cloudflare R2
- Generic demo content that can be seeded into a new database
- Netlify deployment configuration
- A static visual system with no Three.js or animated canvas background

## Documentation

- **[PRODUCTION_SETUP.md](docs/PRODUCTION_SETUP.md)** – Complete launch order for production (MongoDB → R2 → Netlify → domain)
- **[INSTALLATION.md](docs/INSTALLATION.md)** – Local development setup
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** – Netlify deployment details
- **[MEDIA_AND_R2.md](docs/MEDIA_AND_R2.md)** – Media storage, Cloudflare R2 configuration
- **[SUBSTACK.md](docs/SUBSTACK.md)** – Substack, Medium, Paragraph imports
- **[CUSTOMIZATION.md](docs/CUSTOMIZATION.md)** – Customizing pages, blocks, and styles

## Start here

### Requirements

- Node.js 20.19 or newer (Node 22.12+ recommended)
- pnpm 10
- Git
- MongoDB, either through Docker or MongoDB Atlas

Payload is already included in `package.json`. Do not install Payload globally.

### 1. Install the project

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-PORTFOLIO.git
cd YOUR-PORTFOLIO
corepack enable
corepack prepare pnpm@10.23.0 --activate
pnpm install
cp .env.example .env
```

### 2. Start MongoDB

With Docker Desktop installed:

```bash
docker compose up -d mongo
```

The default `.env.example` connects to this database at:

```text
mongodb://127.0.0.1:27017/payload-portfolio
```

You can use MongoDB Atlas instead. Replace `DATABASE_URL` in `.env` with the Atlas connection
string.

### 3. Configure local secrets

Generate secrets:

```bash
openssl rand -base64 32
openssl rand -base64 32
openssl rand -hex 32
```

Use those values for `PAYLOAD_SECRET`, `PREVIEW_SECRET`, and `CRON_SECRET`.

Before using `pnpm seed` on an empty database, also set:

```env
RESTORE_ADMIN_EMAIL=you@example.com
RESTORE_ADMIN_PASSWORD=use-a-unique-long-password
```

### 4. Seed and run

```bash
pnpm seed
pnpm dev
```

Open:

- Portfolio: [http://localhost:3000](http://localhost:3000)
- Payload admin: [http://localhost:3000/admin](http://localhost:3000/admin)

The seed command refuses to overwrite a non-empty database. `RESTORE_FORCE=true` enables a
destructive reseed; use it only when you intend to replace existing content.

## Customize the starter

Set your identity in `.env`:

```env
NEXT_PUBLIC_SITE_OWNER_NAME=Your Name
NEXT_PUBLIC_SITE_OWNER_ROLE=Designer and Developer
NEXT_PUBLIC_SITE_TITLE=Your Name — Portfolio
NEXT_PUBLIC_SITE_DESCRIPTION=Your short portfolio description.
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

Then use Payload admin to edit:

1. **Pages → Home** — hero, calls to action, biography, talks, and highlights
2. **Pages → About** — biography and inquiry content
3. **Projects** — case studies and project media
4. **Posts** — articles and imported newsletter posts
5. **Globals → Header** — navigation
6. **Globals → Footer** — footer links, social links, and subscription visibility
7. **Globals → Brand** — colors, fonts, and radius tokens
8. **Media** — headshots, project screenshots, and social images

See [Customization](docs/CUSTOMIZATION.md) for the complete handoff checklist.

## Connect Substack

There are two separate integrations:

1. The footer subscription form sends readers to your Substack publication.
2. The sync system imports Substack articles into the Payload `posts` collection.

Minimum configuration:

```env
NEXT_PUBLIC_SUBSTACK_URL=https://yourpublication.substack.com
SUBSTACK_SUBSCRIBE_URL=https://yourpublication.substack.com
SUBSTACK_RSS_URL=https://yourpublication.substack.com/feed
SUBSTACK_SYNC_MODE=review
SUBSTACK_SYNC_DOWNLOAD_IMAGES=true
```

Run a one-time import:

```bash
pnpm sync:substack
```

The default `review` mode imports articles as drafts. Review them in Payload before publishing.

See [Substack integration](docs/SUBSTACK.md) for author mapping, images, scheduled sync, modes, and
troubleshooting.

## Deploy

The included configuration targets Netlify. Production requires:

- A hosted MongoDB database
- `DATABASE_URL`
- `PAYLOAD_SECRET`
- `PREVIEW_SECRET`
- `NEXT_PUBLIC_SERVER_URL`
- `NEXT_PUBLIC_SITE_URL`

Cloudflare R2 is recommended for persistent production media because serverless filesystems are
not durable upload storage.

See [Deployment](docs/DEPLOYMENT.md) for the full Netlify, MongoDB Atlas, R2, seeding, cron, and
domain checklist.

## Documentation

- [Installation and Payload setup](docs/INSTALLATION.md)
- [Customization and handoff checklist](docs/CUSTOMIZATION.md)
- [Substack integration](docs/SUBSTACK.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Media and Cloudflare R2](docs/MEDIA_AND_R2.md)
- [Analytics dashboard](docs/ANALYTICS_DASHBOARD_SETUP.md)
- [Image recommendations](docs/IMAGE_RESOLUTIONS.md)

## Common commands

```bash
pnpm dev                 # Start Next.js and Payload
pnpm build               # Production build
pnpm start:only          # Start an existing production build
pnpm seed                # Seed an empty database
pnpm generate:types      # Regenerate Payload TypeScript types
pnpm generate:importmap  # Regenerate Payload admin component imports
pnpm test:int            # Run integration tests
pnpm test:e2e            # Run Playwright tests
pnpm sync:substack       # Import Substack posts
pnpm sync:medium         # Import Medium posts
pnpm sync:paragraph      # Import Paragraph posts
```

After changing a Payload collection, global, block, or field:

```bash
pnpm generate:types
pnpm generate:importmap
pnpm exec tsc --noEmit
```

## Security notes

- Never commit `.env` or `.env.local`.
- Use unique production secrets and passwords.
- Keep `ALLOW_SEED_IN_PROD=false` except during an intentional one-time seed.
- The Local API bypasses access control by default. When acting as a user, pass
  `overrideAccess: false`.
- Nested Payload operations inside hooks must receive the original `req` to participate in the
  same transaction.

## License

MIT. Replace this section if you choose a different license for your portfolio.
