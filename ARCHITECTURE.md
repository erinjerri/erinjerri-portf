# Architecture Overview

## Tech Stack

| Layer | Technology | Version | Role |
|-------|-----------|---------|------|
| **Frontend** | Next.js | 15.4 | React app, routing, SSR/SSG |
| **CMS** | Payload CMS | 3.78 | Embedded content management |
| **Runtime** | Node.js | 20.19+ | Server runtime |
| **Package Manager** | pnpm | 10.23 | Deterministic dependency management |
| **Database** | MongoDB | Latest | Content storage (local or Atlas) |
| **Media Storage** | Cloudflare R2 | - | Production image/video hosting |
| **Styling** | Tailwind CSS | 3.4 | Utility-first CSS |
| **Forms** | React Hook Form | 7.45 | Form state management |
| **Rich Text** | Lexical | Latest | CMS editor with embedded media |
| **Search** | Payload Search Plugin | 3.78 | Full-text search across collections |
| **Deployment** | Netlify | - | Hosting + scheduled functions |

## Project Structure

```
.
├── src/
│   ├── app/
│   │   ├── (frontend)/              # Public Next.js routes
│   │   │   ├── page.tsx             # Homepage
│   │   │   ├── [slug]/              # Dynamic pages
│   │   │   ├── posts/               # Blog posts
│   │   │   ├── projects/            # Portfolio projects
│   │   │   ├── watch/               # Video/media curation
│   │   │   ├── poetry/              # Poetry collection
│   │   │   ├── search/              # Search results
│   │   │   └── layout.tsx           # Frontend layout wrapper
│   │   └── (payload)/               # Payload admin & API
│   │       ├── admin/               # Admin UI routes
│   │       ├── api/                 # Custom API endpoints
│   │       └── next/                # Special routes (seed, sync, etc.)
│   ├── blocks/                      # Page builder blocks
│   │   ├── Content/                 # Text + media block
│   │   ├── MediaBlock/              # Image/video showcase
│   │   ├── CallToAction/            # CTA buttons
│   │   ├── ArchiveBlock/            # Post/project listing
│   │   ├── FormBlock/               # Contact/subscribe forms
│   │   └── ...others
│   ├── collections/                 # Payload collection definitions
│   │   ├── Pages.ts                 # Editable pages
│   │   ├── Posts.ts                 # Blog posts (native + imported)
│   │   ├── Projects.ts              # Portfolio projects
│   │   ├── Media.ts                 # Images, videos, documents
│   │   ├── Categories.ts            # Tags for posts/projects
│   │   ├── Watch.ts                 # Video collections
│   │   ├── Poetry.ts                # Poetry entries
│   │   ├── Documents.ts             # Downloadable docs
│   │   └── Users.ts                 # Admin authentication
│   ├── globals/                     # Global site configuration
│   │   ├── Brand.ts                 # Colors, fonts, logos
│   │   ├── Header.ts                # Navigation
│   │   └── Footer.ts                # Footer links & config
│   ├── components/                  # Reusable React components
│   │   ├── Media.tsx                # Image/video renderer
│   │   ├── RichText.tsx             # Lexical renderer
│   │   ├── CMSLink.tsx              # Smart link component
│   │   └── ...others
│   ├── heros/                       # Hero section variants
│   │   ├── BackgroundCover/         # Full-bleed with overlay
│   │   ├── HighImpact/              # Large portrait + grid layout
│   │   ├── MediumImpact/            # Centered biography hero
│   │   └── ...others
│   ├── blocks/RenderBlocks.tsx      # Block renderer (dispatcher)
│   ├── access/                      # Payload access control functions
│   ├── hooks/                       # Payload hooks (beforeChange, afterRead, etc.)
│   ├── utilities/                   # Helper functions
│   ├── endpoints/                   # Custom API endpoints + seed data
│   │   ├── seed/                    # Starter content
│   │   └── ...custom endpoints
│   ├── jobs/                        # Payload jobs (scheduled tasks)
│   ├── plugins/                     # Payload plugin configuration
│   ├── payload.config.ts            # Main Payload CMS config
│   ├── middleware.ts                # Next.js middleware
│   └── environment.d.ts             # Environment variable types
├── netlify/
│   └── functions/                   # Netlify serverless functions
│       ├── substack-sync-cron.ts    # Scheduled Substack import
│       └── schedule-publish.ts      # Scheduled post publishing
├── public/
│   ├── media/                       # Local media storage (dev only)
│   └── scripts/                     # Analytics init scripts
├── docs/
│   ├── PRODUCTION_SETUP.md          # Launch order & operational steps
│   ├── INSTALLATION.md              # Local dev setup
│   ├── DEPLOYMENT.md                # Netlify deployment
│   ├── MEDIA_AND_R2.md              # R2 storage configuration
│   ├── SUBSTACK.md                  # Content sync integration
│   ├── CUSTOMIZATION.md             # Theming and content model changes
│   ├── ANALYTICS_DASHBOARD_SETUP.md # Admin panel dashboards
│   └── IMAGE_RESOLUTIONS.md         # Responsive image specs
├── .env.example                     # Environment variable template
├── .env.local                       # (git-ignored) Local dev secrets
├── netlify.toml                     # Netlify build config
├── next.config.js                  # Next.js build config
├── payload.config.ts                # Payload CMS config (see src/)
├── package.json                     # Dependencies & scripts
├── pnpm-lock.yaml                   # Locked dependency versions
├── tsconfig.json                    # TypeScript configuration
├── tailwind.config.ts               # Tailwind CSS configuration
└── README.md                        # Project overview (this file)
```

## Data Model

### Collections (User-Editable Content)

| Collection | Purpose | Versioning | Fields |
|-----------|---------|-----------|--------|
| **Pages** | Custom pages (home, about, etc.) | Drafts + scheduled publish | Hero, blocks, SEO, layout |
| **Posts** | Blog posts | Drafts, versions, auto-publish scheduling | Lexical content, category, featured image |
| **Projects** | Portfolio work showcase | Drafts, versions | Description, gallery, links, category |
| **Watch** | Curated video/media | Simple status | Embedded videos, playlists |
| **Poetry** | Published poetry | Simple status | Rich text content |
| **Media** | Images, videos, documents | File storage (R2 or local) | Alt text, captions, MIME type, file size |
| **Categories** | Tags for posts/projects | Simple | Name, slug, description |
| **Documents** | Downloadable PDFs, guides | File storage (R2 or local) | Name, description, file |
| **Users** | Admin authentication | - | Email, password, role |
| **AnalyticsSnapshots** | Historical analytics data | - | Date, metrics snapshot |
| **LinkedInMetrics** | LinkedIn analytics cache | - | Date, follower count, etc. |

### Globals (Site-Wide Configuration)

| Global | Purpose | Fields |
|--------|---------|--------|
| **Brand** | Theme tokens | Colors, fonts, spacing, logos |
| **Header** | Navigation | Logo, navigation links |
| **Footer** | Footer config | Footer links, copyright, Substack subscription |

### Relationships

```
Pages --[hero many:1]--> Media
Pages --[blocks many:many]--> Media (via rich text)
Posts --[author many:1]--> Users
Posts --[category many:1]--> Categories
Posts --[featured image many:1]--> Media
Projects --[featured image many:1]--> Media
Projects --[gallery many:many]--> Media
Categories --[posts many:many]--> Posts
```

## Key Features

### 1. Page Builder

Pages use a **blocks** array to compose layouts:

```typescript
type Page = {
  title: string
  slug: string
  hero: Hero              // Hero variant (highImpact, backgroundCover, etc.)
  layout: Block[]         // Array of composable blocks
  publishedAt: Date
  _status: 'draft' | 'published'
}
```

Available blocks:
- **Content** – Heading + Lexical rich text
- **Media** – Image or video with caption
- **CallToAction** – Button(s) with links
- **Archive** – Dynamic list of posts/projects
- **Form** – Contact or subscribe form
- **Stats** – Stat tile or row
- **Video** – Embedded video player
- **Book/Product Row** – Amazon Associates affiliate products
- And 15+ more specialized blocks

### 2. Content Sync

Imports posts from external sources into the **Posts** collection:

| Source | Command | Mode | Images | Status |
|--------|---------|------|--------|--------|
| **Substack** | `pnpm sync:substack` | review / auto_publish | Optional | Draft or published |
| **Medium** | `pnpm sync:medium` | review / auto_publish | Optional | Draft or published |
| **Paragraph** | `pnpm sync:paragraph` | review / auto_publish | Optional | Draft or published |

Synced posts store source metadata for deduplication and updates.

### 3. Media Storage

**Local Development:**
- Files: `public/media/`
- URLs: `/media/{filename}`
- Served by: Next.js static file serving

**Production:**
- Files: Cloudflare R2 bucket
- URLs: `https://media.yourdomain.com/{filename}` (via custom domain)
- Served by: R2 public endpoint or app proxy
- Metadata: Stored in MongoDB

### 4. Admin Dashboard

Payload exposes the admin UI at `/admin`:
- Edit pages, posts, projects, media
- Live preview of drafts
- SEO metadata preview
- Media gallery with bulk upload
- User management
- Scheduled publishing with cron
- Custom dashboards with widgets

### 5. Scheduled Publishing

Collections with **drafts + versioning** support:
- Save as draft without publishing
- Schedule publish to a future date (requires `CRON_SECRET`)
- Scheduled functions run on Netlify Functions (hourly or per-request)

### 6. Search

Full-text search via Payload Search plugin:
- Index: Pages, Posts, Projects
- Frontend: `/search` route with instant filtering
- Backend: GraphQL `search` field on indexed collections

### 7. Redirects

Payload Redirects plugin manages URL permanence:
- Redirect old slugs to new ones
- Set custom status codes (301, 302, etc.)
- Admin panel for managing redirects

## Authentication & Authorization

### Roles

Users can have roles (stored in JWT for fast access):
- `admin` – Full access
- Other roles can be defined per-collection

### Access Control

**Collection-level:**
- `create` – Who can create documents
- `read` – Who can view documents (or filtered results)
- `update` – Who can edit documents
- `delete` – Who can delete documents

**Common patterns:**
- Authenticated users only (admin, editors)
- Published docs visible to anyone
- Drafts visible only to authenticated users
- Row-level security (e.g., your own posts only)

## API & Routes

### Payload Admin & API Routes

| Route | Type | Purpose |
|-------|------|---------|
| `GET /admin` | Admin UI | Payload dashboard |
| `GET /admin/login` | Admin UI | Authentication |
| `POST /api/[collection]` | API | Create document |
| `GET /api/[collection]` | API | List documents (with filters) |
| `GET /api/[collection]/[id]` | API | Fetch single document |
| `PATCH /api/[collection]/[id]` | API | Update document |
| `DELETE /api/[collection]/[id]` | API | Delete document |
| `GET /api/search` | API | Full-text search |
| `POST /next/seed` | Internal | Seed starter content |
| `POST /next/sync-substack` | Internal | Substack import (cron) |
| `POST /next/sync-content` | Internal | Medium/Paragraph import (cron) |
| `GET /api/media/file/[filename]` | Proxy | Serve R2 media via app |

### Next.js Frontend Routes

| Route | Type | Purpose |
|-------|------|---------|
| `/` | Page | Homepage (via `[slug]` with slug='home') |
| `/posts` | Archive | Posts listing |
| `/projects` | Archive | Projects listing |
| `/watch` | Archive | Video curation |
| `/poetry` | Archive | Poetry listing |
| `/search` | Form + Results | Search posts/pages |
| `/[slug]` | Dynamic | Editable pages (about, contact, etc.) |
| `/posts/[slug]` | Dynamic | Individual blog post |
| `/projects/[slug]` | Dynamic | Individual project |
| `/watch/[slug]` | Dynamic | Individual video collection |
| `/poetry/[slug]` | Dynamic | Individual poem |
| `/*` | Catch-all | Redirects (via Payload Redirects) or 404 |

## Build & Deployment

### Local Development

```bash
pnpm dev              # Start Next.js dev server (Port 3000)
pnpm build            # Build Next.js app
pnpm start            # Serve built app
```

### Production (Netlify)

Build command: `pnpm run build:netlify`
- Builds Next.js app
- Generates Payload types
- No database operations during build
- Uses environment variables for config

Netlify Functions:
- `netlify/functions/substack-sync-cron.ts` – Runs hourly (if `SUBSTACK_SYNC_ENABLED`)
- `netlify/functions/schedule-publish.ts` – Drains scheduled publish queue

## Environment Variables

See `.env.example` for complete list. Key categories:

| Category | Variables |
|----------|-----------|
| **Database** | `DATABASE_URL` |
| **Secrets** | `PAYLOAD_SECRET`, `PREVIEW_SECRET`, `CRON_SECRET` |
| **Site URLs** | `NEXT_PUBLIC_SERVER_URL`, `NEXT_PUBLIC_SITE_URL` |
| **Identity** | `NEXT_PUBLIC_SITE_OWNER_NAME`, `NEXT_PUBLIC_SITE_TITLE`, etc. |
| **R2 Media** | `USE_R2_STORAGE`, `R2_ACCOUNT_ID`, `R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` |
| **Substack** | `SUBSTACK_RSS_URL`, `SUBSTACK_SYNC_MODE`, `SUBSTACK_SYNC_ENABLED` |
| **Medium/Paragraph** | `MEDIUM_SYNC_ENABLED`, `PARAGRAPH_SYNC_ENABLED`, etc. |
| **Analytics** | `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_ENABLE_CLARITY` |
| **Email** | `PROTON_SMTP_USER`, `PROTON_SMTP_TOKEN` (optional) |
| **Netlify** | `ALLOW_SEED_IN_PROD`, `RESTORE_ADMIN_EMAIL` (one-time setup) |

## Performance Considerations

### Image Optimization

- Next.js `next/image` component handles responsive images
- Supported formats: JPEG, PNG, WebP, AVIF
- Auto-generates srcset for `srcset` attribute
- See `docs/IMAGE_RESOLUTIONS.md` for detailed specs

### Caching

- Next.js ISR (Incremental Static Regeneration) for pages
- Netlify cache headers for media (1 year for immutable assets)
- Payload responses cached with revalidation tags

### Database

- Indexes on frequently queried fields (slug, status, createdAt)
- Depth limits on relationships to prevent over-fetching
- Select specific fields when not all are needed

## Security

### Access Control

- Collections default to authenticated-only access
- Public pages use `authenticatedOrPublished` (published visible to all)
- Field-level access for sensitive data
- Roles-based access (JWT-based fast checks)

### Secrets

- `PAYLOAD_SECRET` – Encrypts JWT tokens
- `PREVIEW_SECRET` – Validates draft preview URLs
- `CRON_SECRET` – Authenticates scheduled sync requests
- `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` – Stabilizes Server Action IDs

### CORS & Same-Site

- Payload admin accepts requests from `NEXT_PUBLIC_SERVER_URL`
- Media proxy checks authorization headers
- Form submissions validate CSRF tokens

## Monitoring & Observability

### Analytics (Optional)

- **Google Analytics** (via `NEXT_PUBLIC_GA_MEASUREMENT_ID`)
- **Microsoft Clarity** (via `NEXT_PUBLIC_CLARITY_PROJECT_ID`)
- **LinkedIn metrics** cache (stored in `linkedinMetrics` collection)

### Dashboards

Custom Payload admin widgets can display:
- Content counts (pages, posts, media)
- Recent analytics snapshots
- Sync status (Substack, Medium, Paragraph)
- User activity

See `docs/ANALYTICS_DASHBOARD_SETUP.md` for setup.

## Common Workflows

### Publishing a Post

1. Go to `/admin` → Posts
2. Click **Create**
3. Enter title, content, category
4. Upload featured image
5. Save as draft
6. Test via draft preview
7. Click **Publish** or schedule for later

### Syncing Substack

1. Configure `SUBSTACK_RSS_URL` and `SUBSTACK_SYNC_MODE`
2. Run `pnpm sync:substack` (one-time) or enable `SUBSTACK_SYNC_ENABLED=true` (automatic)
3. Review imported drafts in `/admin` → Posts
4. Edit, approve, or delete as needed
5. Publish when ready

### Adding a Custom Page

1. Go to `/admin` → Pages
2. Click **Create**
3. Enter title, slug (auto-generated from title)
4. Choose a hero type (highImpact, backgroundCover, etc.)
5. Add blocks (content, media, CTA, forms, etc.)
6. Save and preview
7. Publish

### Uploading Media

1. Go to `/admin` → Media
2. Drag and drop or click **Upload**
3. Enter alt text and caption
4. Save
5. Media is available in all rich-text editors and Media field pickers

## Next Steps

- **Local setup:** See [INSTALLATION.md](docs/INSTALLATION.md)
- **Production launch:** See [PRODUCTION_SETUP.md](docs/PRODUCTION_SETUP.md)
- **Customizing content model:** See [CUSTOMIZATION.md](docs/CUSTOMIZATION.md)
- **Troubleshooting:** See [INSTALLATION.md](docs/INSTALLATION.md#troubleshooting)
