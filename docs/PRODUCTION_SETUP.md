# Production Setup: Complete Launch Order

This guide covers the complete production setup for this Payload + Next.js portfolio site, paralleling the [cyra-site](https://github.com/erinjerri/cyra-site) architecture.

## Stack Overview

- **Frontend:** Next.js 15 (React 19, App Router, Tailwind CSS)
- **CMS:** Payload CMS 3.78 (embedded in Next.js)
- **Database:** MongoDB Atlas (production), local Docker (development)
- **Media Storage:** Cloudflare R2 (production) or local `public/media/` (development)
- **Hosting:** Netlify (with scheduled functions for Substack/Medium sync)
- **DNS/CDN:** Cloudflare

---

## Part 1: Content Model Overview

### What's Editable in the CMS

| Type | Editable | Stored in | Notes |
|------|----------|-----------|-------|
| **Pages** | ✅ Yes | MongoDB | Home, about, contact, custom pages |
| **Posts** | ✅ Yes | MongoDB | Blog posts from Substack, Medium, Paragraph, or native |
| **Projects** | ✅ Yes | MongoDB | Portfolio work showcase |
| **Watch** | ✅ Yes | MongoDB | Video/media curation |
| **Poetry** | ✅ Yes | MongoDB | Published poetry (optional) |
| **Media** | ✅ Yes | MongoDB (metadata) + R2 (files) | Images, videos, documents |
| **Categories** | ✅ Yes | MongoDB | Post and project tags |
| **Header** | ✅ Yes | MongoDB | Global navigation config |
| **Footer** | ✅ Yes | MongoDB | Global footer config |
| **Brand** | ✅ Yes | MongoDB | Brand colors, fonts, logos |

### What Remains Hard-Coded or Environment-Driven

| Item | Source | Examples |
|------|--------|----------|
| **Site identity** | Env vars | `NEXT_PUBLIC_SITE_OWNER_NAME`, `NEXT_PUBLIC_SITE_TITLE` |
| **Third-party integrations** | Env vars | Substack, Medium, Paragraph URLs; Google Analytics; Clarity |
| **Routes & layouts** | Code | `/admin`, `/posts`, `/projects`, `/search`, `/poetry` |
| **Page templates** | Code | Hero types, block components, form types |
| **SEO metadata** (fallback) | Code + CMS | Defaults set per collection, overridable per page |

### Editable Collections

**Pages Collection:**
- Title, slug (auto-generated)
- Hero (background cover, high-impact, medium-impact, or topline)
- Hero media (background image, portrait, 3-image grid)
- Layout blocks (content, media, CTA, forms, video, archive, stats, etc.)
- Publishing state (published, draft, scheduled)
- SEO (meta title, description, image)

**Posts Collection:**
- Title, slug
- Content (Lexical rich text with embedded media)
- Category, author
- Featured image
- Publishing state & dates
- SEO metadata
- Substack sync metadata (if imported)

**Projects Collection:**
- Title, slug
- Description, featured image, gallery
- Category, tags
- External link (to live project)
- Publishing state
- SEO metadata

**Media Collection:**
- Stores metadata in MongoDB
- Actual files stored in R2 (or `public/media/` locally)
- Alt text, captions, MIME type
- Linked to pages, posts, projects

**Globals:**
- Header (logo, navigation links)
- Footer (footer links, copyright)
- Brand (color palette, typography, logos)

---

## Part 2: Standard Install Instructions

### Fresh Install

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
cd YOUR-REPOSITORY
corepack enable
corepack prepare pnpm@10.23.0 --activate
pnpm install
```

### Required Environment Variables

Create `.env.local`:

```env
# Database
DATABASE_URL=mongodb://127.0.0.1:27017/payload-portfolio

# Secrets (generate: openssl rand -base64 32)
PAYLOAD_SECRET=your-unique-secret-here
PREVIEW_SECRET=your-unique-preview-secret-here

# Site URLs (no trailing slash)
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Portfolio identity
NEXT_PUBLIC_SITE_OWNER_NAME=Your Name
NEXT_PUBLIC_SITE_OWNER_ROLE=Designer and Developer
NEXT_PUBLIC_SITE_TITLE=Your Name — Portfolio
NEXT_PUBLIC_SITE_DESCRIPTION=Portfolio and selected work.
```

See `.env.example` for all optional variables (Substack, Medium, Paragraph, R2, analytics, etc.).

### Type Generation Order

When you modify Payload collections or globals:

```bash
# 1. Generate TypeScript types from Payload config
pnpm generate:types

# 2. Generate Payload admin import map
pnpm generate:importmap

# 3. Check for TypeScript errors
pnpm exec tsc --noEmit

# 4. Commit generated files
git add src/payload-types.ts src/app/\(payload\)/admin/importMap.js
git commit -m "Update Payload types and import map"
```

These generated files must be committed to Git.

### When to Seed

**Local development (fresh database):**

```bash
# Add to .env.local
RESTORE_ADMIN_EMAIL=you@example.com
RESTORE_ADMIN_PASSWORD=use-a-unique-long-password

# Seed starter content
pnpm seed
```

This creates:
- Admin user
- Pages (home, about, contact, speaking)
- Posts, categories, media
- Header, footer, brand globals
- Contact and speaking forms

**Production:**
- Do NOT seed in production. See [Production Launch Order](#part-3-production-launch-order).
- Seeding deletes and replaces all starter collections.

---

## Part 3: Production Launch Order

Follow this exact order to avoid configuration issues and ensure media works correctly.

### 1. Set Up MongoDB Atlas

1. Create a production cluster:
   - Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create project → Create cluster (M0 free tier acceptable for small sites)
   - Region: Match your hosting region if possible

2. Create a database user:
   - Go to Database Access
   - Create user with a strong, unique password
   - Copy the connection string

3. Permit connections from Netlify:
   - Go to Network Access
   - Add IP ranges: `0.0.0.0/0` (Netlify uses dynamic IPs)
   - Alternatively, whitelist your Netlify deployment IP after first deploy

4. Create separate databases:
   ```
   Local:       payload-portfolio-dev
   Production:  payload-portfolio-prod
   ```
   Same MongoDB Atlas account, different database names.

5. Update connection string:
   - Replace password placeholder
   - URL-encode special characters (use MongoDB's encode tool or `encodeURIComponent()`)
   - Format: `mongodb+srv://user:password@cluster.mongodb.net/payload-portfolio-prod?retryWrites=true&w=majority`

**✅ Check:** Connect from your machine:
```bash
mongosh "mongodb+srv://user:password@cluster.mongodb.net/payload-portfolio-prod"
```

### 2. Set Up Cloudflare R2

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → R2

2. Create a bucket:
   - Bucket name: `portfolio-media` (or `yourname-portfolio-media`)
   - Region: Geographically closer to your users
   - Do NOT make public (we'll use a custom domain instead)

3. Create an API token:
   - Go to Account Settings → API Tokens → Create API token
   - Select "R2 Edit" scope
   - Grant access to specific buckets only
   - Copy:
     - Account ID (shown in Account Home)
     - Access Key ID
     - Secret Access Key

4. Add a custom domain for public access:
   - Go to R2 → your bucket → Settings → Custom Domain
   - Add `media.yourdomain.com` (you'll configure DNS next)
   - **Do not** use the public R2 URL; it's not browser-accessible

**✅ Check:** List bucket contents via AWS CLI:
```bash
aws s3 ls s3://portfolio-media --endpoint-url https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
```

### 3. Set Up Netlify Hosting

1. Connect GitHub repository:
   - Go to [Netlify](https://netlify.com) → Add new site → Import an existing project
   - Select your GitHub repository
   - Netlify auto-detects `netlify.toml`
   - Build command: `pnpm run build:netlify` (do not override)

2. Add production environment variables:
   ```env
   # Database
   DATABASE_URL=mongodb+srv://user:password@cluster.mongodb.net/payload-portfolio-prod?retryWrites=true&w=majority

   # Secrets (generate: openssl rand -base64 32 for each)
   PAYLOAD_SECRET=unique-secret-for-production
   PREVIEW_SECRET=unique-preview-secret-for-production
   CRON_SECRET=unique-cron-secret-for-scheduled-sync

   # Site URLs
   NEXT_PUBLIC_SERVER_URL=https://yoursite.com
   NEXT_PUBLIC_SITE_URL=https://yoursite.com

   # Portfolio identity
   NEXT_PUBLIC_SITE_OWNER_NAME=Your Name
   NEXT_PUBLIC_SITE_TITLE=Your Name — Portfolio
   NEXT_PUBLIC_SITE_DESCRIPTION=Your portfolio description.

   # R2 media storage
   USE_R2_STORAGE=true
   R2_ACCOUNT_ID=your-cloudflare-account-id
   R2_BUCKET=portfolio-media
   R2_ACCESS_KEY_ID=your-access-key-id
   R2_SECRET_ACCESS_KEY=your-secret-access-key
   R2_PUBLIC_HOSTNAME=https://media.yourdomain.com

   # Disable seeding in production
   ALLOW_SEED_IN_PROD=false
   ```

3. Trigger first deploy:
   - Netlify auto-deploys on commit
   - Check build logs for errors
   - Build should complete without database queries (cold-start OK)

**✅ Check:** Netlify dashboard shows successful deploy with green checkmark

### 4. Deploy the App

Wait for first deployment to complete, then verify:

```bash
# Open admin
https://your-netlify-site.netlify.app/admin

# Expected: 404 or redirect (no admin user yet)
```

### 5. Create Admin User & Seed

1. Create admin via Payload UI:
   ```
   Open: https://your-netlify-site.netlify.app/admin
   You should see error or setup screen
   If no error, skip to step 2
   ```

2. If setup screen doesn't appear, manually create admin:
   - SSH into Netlify Functions (if possible) or use a temporary script
   - Alternatively, use a one-time seeding approach:

3. **One-time seed (recommended approach):**
   - Add `ALLOW_SEED_IN_PROD=true` to Netlify env vars
   - Redeploy: `git commit --allow-empty -m "trigger deploy" && git push`
   - Go to `/admin` → Dashboard → Seed
   - Click "Seed Starter Content"
   - Remove `ALLOW_SEED_IN_PROD=true` and redeploy
   - Admin user is now created

**✅ Check:** Can sign into `/admin` with seed email/password

### 6. Upload Test Image to R2

1. Go to `/admin` → Media
2. Upload a test image (JPEG or PNG)
3. Verify in Payload UI:
   - File appears in Media collection
   - Alt text can be edited
4. Test public URL:
   - Visit `https://media.yourdomain.com/{image-filename}` (after DNS is set up)
   - Image should load (may 404 if DNS not configured yet—expected)

**✅ Check:** Media metadata exists in MongoDB, file exists in R2 bucket

### 7. Configure Cloudflare DNS

1. Point domain registrar to Cloudflare nameservers:
   - Log into registrar (GoDaddy, Namecheap, etc.)
   - Update nameservers to Cloudflare's (varies by registrar)
   - Wait 12–24 hours for propagation

2. Add DNS records in Cloudflare:
   ```
   Type    Name        Content                              Proxy
   CNAME   @           your-netlify-site.netlify.app        Proxied
   CNAME   media       media.yourdomain.com.s3.{account-id}.r2.cloudflarestorage.com  Proxied
   ```

3. Update Netlify DNS settings (if using Netlify nameservers instead):
   - Go to Netlify → Domain settings
   - Add custom domain
   - Follow Netlify's DNS record setup

**✅ Check:** 
```bash
nslookup yourdomain.com
dig yourdomain.com
```
Should resolve to Netlify IP.

### 8. Update Site URLs & Redeploy

1. Update Netlify env vars:
   ```env
   NEXT_PUBLIC_SERVER_URL=https://yourdomain.com
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   ```

2. Redeploy:
   ```bash
   git commit --allow-empty -m "Update site URLs" && git push
   ```

3. Verify in Netlify:
   - Deploy completes successfully
   - Check build logs for any R2 errors

**✅ Check:**
- Homepage loads: `https://yourdomain.com`
- Admin works: `https://yourdomain.com/admin`
- Favicon loads without 404s
- Open Graph image works (check social preview)

### 9. Launch Verification Checklist

Test all of these on production:

- [ ] **Homepage** loads with correct title and metadata
- [ ] **Admin** login works, can edit content
- [ ] **Media upload** works: upload in `/admin`, confirm in R2 bucket
- [ ] **Image rendering** on pages: previously uploaded image displays correctly
- [ ] **Posts/Projects** load and render correctly
- [ ] **Search** works (if enabled)
- [ ] **Contact form** submits without errors
- [ ] **Navigation** links resolve correctly
- [ ] **Mobile view** is responsive and readable
- [ ] **404 page** works (`/nonexistent-page`)
- [ ] **Draft preview** works (sign in to `/admin`, update draft, preview)
- [ ] **Canonical links** point to production domain
- [ ] **Sitemap** loads: `/sitemap.xml` (check Google Search Console)
- [ ] **Robots.txt** looks correct: `/robots.txt`

---

## Part 4: Media Storage Deep Dive

### Storage Architecture

**MongoDB stores metadata only:**
```json
{
  "_id": "...",
  "filename": "portfolio-hero.webp",
  "mimeType": "image/webp",
  "filesize": 245000,
  "width": 1600,
  "height": 900,
  "alt": "Portfolio hero illustration",
  "caption": "...",
  "url": "https://media.yourdomain.com/portfolio-hero.webp"
}
```

**R2 stores actual files:**
- Bucket: `portfolio-media/`
- Path: `media/{filename}`
- Not directly accessible; served via custom domain

### Local vs. Production Storage Modes

#### Local Development (public/media/)
```
Environment: NEXT_PUBLIC_USE_PAYLOAD_MEDIA_PROXY=false (default)
Files: src/public/media/
URLs: /media/{filename}
Served by: Next.js static files
```

#### Production (Cloudflare R2)
```
Environment: 
  USE_R2_STORAGE=true
  R2_PUBLIC_HOSTNAME=https://media.yourdomain.com
Files: R2 bucket portfolio-media/
URLs: https://media.yourdomain.com/{filename}
Served by: Cloudflare R2 (via custom domain)
```

### Media Upload Smoke Test

1. **Prepare:** Start with empty R2 bucket

2. **Upload via CMS:**
   ```
   Go to /admin → Media → Upload
   Select: 1000×600px JPG (name: test-image.jpg)
   Enter alt text: "Test image for production verification"
   Publish
   ```

3. **Verify in Payload:**
   - File appears in Media collection
   - Metadata shows correct size, alt text
   - Preview thumbnail shows

4. **Test public URL:**
   ```bash
   curl -I https://media.yourdomain.com/test-image.jpg
   # Expected: 200 OK
   ```

5. **Redeploy app (with media still in R2):**
   ```bash
   git commit --allow-empty -m "test redeploy" && git push
   ```

6. **Verify image still loads:**
   ```bash
   curl -I https://media.yourdomain.com/test-image.jpg
   # Expected: still 200 OK
   ```

7. **Check image on page:**
   - Go to homepage or any published page
   - If it displays uploaded image, media persistence works ✅

### Troubleshooting Media Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Uploads appear in CMS but not publicly | R2 custom domain not set up | Configure `media.yourdomain.com` in R2 bucket settings |
| 403 Forbidden on media URLs | R2 bucket is private, domain not configured | Add custom domain; ensure `R2_PUBLIC_HOSTNAME` matches |
| Images 404 after redeploy | Local `/public/media/` deleted | Confirm `USE_R2_STORAGE=true` in production env vars |
| Image uploads hang | R2 credentials wrong | Test: `aws s3 ls s3://portfolio-media --endpoint-url ...` |

---

## Part 5: Domain & Hosting Configuration

### Domain Setup

| Configuration | Where | Value |
|---------------|-------|-------|
| **Registrar** | GoDaddy, Namecheap, etc. | Update nameservers to Cloudflare |
| **Nameservers** | Cloudflare | Configured automatically after adding domain |
| **Main DNS** | Cloudflare Dashboard | `CNAME @ → netlify-site.netlify.app` |
| **Media subdomain** | Cloudflare Dashboard | `CNAME media → R2 bucket endpoint` |
| **SSL/TLS** | Cloudflare → SSL/TLS | Set to "Full" or "Full (Strict)" |

### Environment Variables for Domain

```env
# After domain is live and DNS is propagated
NEXT_PUBLIC_SERVER_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Optional: poetry subdomain
NEXT_PUBLIC_POETRY_HOSTNAME=poetry.yourdomain.com
```

If using poetry subdomain:
1. Add DNS record: `CNAME poetry → netlify-site.netlify.app`
2. Add alternate domain in Netlify domain settings
3. Ensure Cloudflare is proxying the record

### Hosting Environment

- **Runtime:** Netlify Functions (serverless Node.js)
- **Database access:** From Netlify's IP space (should be whitelisted in MongoDB)
- **Build command:** `pnpm run build:netlify`
- **Node version:** 20.19+ or 22.12+ (auto-detected from `.nvmrc`)
- **Scheduled functions:** `netlify/functions/*` (for Substack sync if enabled)

---

## Part 6: Quick Reference Env Vars

### Required for Production

```env
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/payload-portfolio-prod
PAYLOAD_SECRET=unique-long-secret
PREVIEW_SECRET=unique-long-secret
CRON_SECRET=unique-long-secret
NEXT_PUBLIC_SERVER_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_OWNER_NAME=Your Name
```

### Required for R2 Media

```env
USE_R2_STORAGE=true
R2_ACCOUNT_ID=your-account-id
R2_BUCKET=portfolio-media
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_PUBLIC_HOSTNAME=https://media.yourdomain.com
```

### Optional: Substack, Medium, Paragraph Sync

See [SUBSTACK.md](SUBSTACK.md) for full details. Enable via:

```env
SUBSTACK_RSS_URL=https://yourpub.substack.com/feed
SUBSTACK_SYNC_ENABLED=true
SUBSTACK_SYNC_MODE=review
```

### Optional: Analytics

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_ENABLE_CLARITY=true
NEXT_PUBLIC_CLARITY_PROJECT_ID=xxxxx
```

---

## Rollback & Recovery

### Git Rollback (Code Only)

If a code deployment breaks:

```bash
git revert HEAD
git push
```

Netlify auto-redeploys. Database and media files are unaffected.

### Database Rollback

Rollback a destructive content change:

1. Restore MongoDB backup (kept separate from Git)
2. Rollback media files if needed (R2 bucket versioning, if enabled)
3. Notify team of recovery

**Never** rely on Git history for Payload content recovery. Keep frequent MongoDB backups.

---

## Next Steps

1. Read [DEPLOYMENT.md](DEPLOYMENT.md) for additional deployment considerations
2. Read [MEDIA_AND_R2.md](MEDIA_AND_R2.md) for media optimization details
3. Read [SUBSTACK.md](SUBSTACK.md) if syncing external content
4. Read [INSTALLATION.md](INSTALLATION.md) for local dev setup
