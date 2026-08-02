# Payload Portfolio Starter

A professional, customizable portfolio and blog template built with [Payload CMS](https://payloadcms.com/) and [Next.js](https://nextjs.org/). Designed to be deployed, self-hosted, and templatized for reuse.

**Perfect for:** Designers, developers, writers, executives, and speakers who want an editable website without platform lock-in.

## What's Included

### Content Management
- ✅ Payload admin panel (`/admin`) for editing everything
- ✅ **Pages** – Customizable pages (home, about, contact) with block-based layouts
- ✅ **Posts** – Blog/newsletter articles with SEO, drafts, and scheduled publishing
- ✅ **Projects** – Portfolio work showcase with galleries
- ✅ **Watch** – Video and media curation
- ✅ **Poetry** – Optional poetry collection with dedicated routing
- ✅ **Media** – Image/video/document storage (local or Cloudflare R2)
- ✅ **Categories** – Tags for organizing content
- ✅ **Globals** – Site-wide config (header, footer, branding, theme tokens)

### Publishing & Workflow
- ✅ Drafts & versions – Save as draft, schedule publish, edit history
- ✅ Live preview – See edits in real-time before publishing
- ✅ SEO fields – Meta title, description, OpenGraph image per page
- ✅ Redirects – Manage URL permanence with Payload Redirects plugin
- ✅ Search – Full-text search across pages, posts, projects
- ✅ Scheduled publishing – Publish on a schedule via cron

### Integrations
- ✅ **Substack** – Import articles via RSS, subscribe button in footer
- ✅ **Medium** – Import articles via RSS
- ✅ **Paragraph** – Import articles via RSS
- ✅ **Analytics** – Google Analytics and Microsoft Clarity
- ✅ **Email** – SMTP notifications for form submissions
- ✅ **Amazon Associates** – Affiliate product blocks with custom tags
- ✅ **Cloudflare R2** – Persistent media storage for production

### Deployment
- ✅ **Netlify** – Pre-configured with scheduled functions
- ✅ **Docker** – Local MongoDB setup included
- ✅ **MongoDB** – Support for local Docker or MongoDB Atlas
- ✅ **TypeScript** – Full type safety throughout
- ✅ **Testing** – Integration (vitest) and E2E (Playwright) test setup

### Developer Experience
- ✅ Modern tech stack – Next.js 15, React 19, TypeScript, Tailwind CSS
- ✅ No build-time database calls – Zero hydration mismatches
- ✅ Static visual system – No Three.js, Framer Motion, or canvas animations
- ✅ Responsive design – Mobile-first, works on all devices
- ✅ Accessibility – WCAG 2.1 AA compliant

## Quick Links

**For Starting Out:**
- 👀 [Architecture Overview](ARCHITECTURE.md) – Tech stack, data model, project structure
- 🚀 [Installation & Setup](docs/INSTALLATION.md) – Local development in 5 minutes
- 📝 [Customization Guide](docs/CUSTOMIZATION.md) – Handoff checklist to make it yours

**For Production:**
- 🌍 [Production Setup](docs/PRODUCTION_SETUP.md) – Complete launch order (MongoDB → R2 → Netlify → DNS)
- 🚢 [Deployment](docs/DEPLOYMENT.md) – Netlify configuration and best practices
- 🖼️ [Media & R2](docs/MEDIA_AND_R2.md) – Cloudflare R2 setup and troubleshooting

**For Content Sync:**
- 📰 [Substack Integration](docs/SUBSTACK.md) – Import articles, set up footer subscription

**For Contributors:**
- 🤝 [Contributing](CONTRIBUTING.md) – Development workflow, coding standards, PR process
- 🛠️ [Payload CMS Guide](AGENTS.md) – Payload patterns and security best practices

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

## Development Commands

### Running the App

```bash
pnpm dev              # Start Next.js dev server (port 3000) + Payload
pnpm build            # Build Next.js app for production
pnpm start:only       # Run a pre-built app (requires pnpm build first)
pnpm start:fresh      # Clean build + start
```

### Database & Content

```bash
pnpm seed             # Seed empty database with starter content
pnpm sync:substack    # Import Substack posts (one-time)
pnpm sync:medium      # Import Medium posts (one-time)
pnpm sync:paragraph   # Import Paragraph posts (one-time)
```

### Code Generation & Quality

```bash
pnpm generate:types      # Regenerate Payload TypeScript types (run after schema changes)
pnpm generate:importmap  # Regenerate Payload admin component paths (run after adding blocks/components)
pnpm exec tsc --noEmit   # Type-check without emitting files
pnpm lint                # Run ESLint
pnpm lint:fix            # Fix linting errors
```

### Testing

```bash
pnpm test:int   # Run integration tests (vitest)
pnpm test:e2e   # Run end-to-end tests (Playwright)
pnpm test       # Run all tests
```

### Monitoring & Analysis

```bash
pnpm analyze    # Analyze Next.js bundle size
```

**Workflow after changing Payload schema:**

```bash
# 1. Update src/collections/ or src/globals/
# 2. Regenerate types and import map
pnpm generate:types
pnpm generate:importmap

# 3. Type-check
pnpm exec tsc --noEmit

# 4. Restart dev server
# (Ctrl+C and pnpm dev)
```

## Environment Variables

See `.env.example` for all available variables. Key ones:

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | MongoDB connection string |
| `PAYLOAD_SECRET` | Yes | JWT encryption secret |
| `NEXT_PUBLIC_SERVER_URL` | Yes | Site URL for CORS, preview links, etc. |
| `NEXT_PUBLIC_SITE_OWNER_NAME` | Yes | Your name (used in metadata, hero) |
| `SUBSTACK_RSS_URL` | No | For Substack post import |
| `USE_R2_STORAGE` | No | Enable Cloudflare R2 (production) |
| `R2_ACCOUNT_ID`, etc. | No | R2 credentials (if using R2) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | No | Google Analytics |
| `NEXT_PUBLIC_ENABLE_CLARITY` | No | Microsoft Clarity |

## Security Notes

### Must Do

- ✅ Never commit `.env` or `.env.local` – add to `.gitignore` (already done)
- ✅ Use **unique** secrets for each environment (dev, staging, production)
- ✅ Generate secrets with `openssl rand -base64 32` (not your birthday, etc.)
- ✅ Keep `ALLOW_SEED_IN_PROD=false` in production

### Payload CMS Patterns

- ✅ When using the Local API with a user context, always pass `overrideAccess: false`
  ```typescript
  await payload.find({
    collection: 'posts',
    user: someUser,
    overrideAccess: false,  // REQUIRED
  })
  ```

- ✅ Nested operations in hooks must receive `req` to stay in the same transaction
  ```typescript
  await req.payload.create({
    collection: 'logs',
    data: { ... },
    req,  // REQUIRED
  })
  ```

See [AGENTS.md](AGENTS.md) for comprehensive Payload security patterns.

## File Structure

```
.
├── src/
│   ├── app/
│   │   ├── (frontend)/          # Public routes
│   │   │   ├── page.tsx         # Homepage
│   │   │   ├── posts/           # Blog posts
│   │   │   ├── projects/        # Portfolio projects
│   │   │   └── [slug]/          # Dynamic pages
│   │   └── (payload)/           # Admin & API
│   ├── collections/             # Payload collections (Pages, Posts, Media, etc.)
│   ├── globals/                 # Payload globals (Header, Footer, Brand)
│   ├── blocks/                  # Page builder blocks
│   ├── components/              # React components
│   ├── heros/                   # Hero section variants
│   ├── utilities/               # Helper functions
│   ├── payload.config.ts        # Payload CMS configuration
│   └── middleware.ts            # Next.js middleware
├── docs/                        # Documentation
├── netlify/functions/           # Netlify serverless functions
├── public/media/                # Local media storage (dev only)
├── .env.example                 # Environment variables template
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

Full structure: See [ARCHITECTURE.md](ARCHITECTURE.md)

## Troubleshooting

**Port 3000 is busy:**
```bash
lsof -ti :3000 | xargs kill -9
pnpm dev -- --port 3001  # Or use different port
```

**MongoDB connection refused:**
```bash
docker compose ps          # Check if mongo is running
docker compose logs mongo  # View logs
docker compose up -d mongo # Start if not running
```

**TypeScript errors after schema changes:**
```bash
pnpm generate:types
pnpm generate:importmap
pnpm exec tsc --noEmit
```

**Admin panel shows import errors:**
```bash
pnpm generate:importmap
pnpm build  # Verify build succeeds
```

**Seed fails:**
```bash
# If database not empty, force reset:
RESTORE_FORCE=true pnpm seed
```

More help: See [INSTALLATION.md](docs/INSTALLATION.md#troubleshooting) and [CONTRIBUTING.md](CONTRIBUTING.md#troubleshooting).

## License

MIT. Replace this section if you choose a different license for your portfolio.
