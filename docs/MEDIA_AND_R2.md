# Media Storage: public/media and R2

This project supports two media storage modes:

1. **Local (public/media)** – Files stored in `public/media/`, served by Next.js at `/media/*`
2. **R2 (Cloudflare)** – Files stored in Cloudflare R2, served via public hostname or app proxy

## Configuration

### Local storage (default)

When R2 is **not** enabled, Payload stores uploads in `public/media/` (see `src/collections/Media.ts`). Files are served directly by Next.js at `/media/<filename>`.

No extra env vars are required.

### R2 storage

Set `USE_R2_STORAGE=true` and configure R2 credentials:

```env
USE_R2_STORAGE=true
R2_BUCKET=your-bucket-name
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com   # optional, auto-derived from R2_ACCOUNT_ID
R2_FORCE_PATH_STYLE=true   # optional, default true
R2_MEDIA_PREFIX=media      # optional, prefix for object keys (default: media)
```

### Serving R2 files publicly

R2’s S3 API URL (`r2.cloudflarestorage.com`) is **not** publicly readable in the browser. You must expose files via one of these options:

#### Option A: Custom domain (recommended)

Use a Cloudflare R2 custom domain (e.g. `media.yourdomain.com`):

```env
R2_PUBLIC_HOSTNAME=https://media.yourdomain.com
```

Configure the domain in Cloudflare Dashboard → R2 → your bucket → Settings → Custom Domains.

#### Option B: App proxy

If you don’t use a custom domain, the app proxies R2 files via `/api/media/file/[filename]`. The `rewriteBrokenR2Urls` hook rewrites broken R2 URLs to this proxy path.

**Important:** The proxy route requires `R2_BUCKET` to be set. If you use R2 storage, you must have R2 env vars configured.

#### Option C: Public bucket (not recommended)

```env
R2_PUBLIC_READS=true
```

This uses the direct R2 S3 URL, which is typically not publicly readable. Prefer Option A or B.

## Substack, Medium, and Paragraph sync images

When syncing Substack, Medium, or Paragraph posts with image downloads enabled, the sync:

1. Downloads source images from the origin CDN
2. Creates Media documents via `payload.create`
3. Stores files in `public/media` (local) or R2 (when enabled)
4. Rewrites post HTML so Lexical creates Upload nodes referencing those Media docs

If images appear as **links** instead of embedded media, the image download is failing (Substack CDN may block Node’s default fetch). Try:

- `DEBUG_SUBSTACK_SYNC=true pnpm sync:substack` to see which URLs fail
- `DEBUG_MEDIUM_SYNC=true pnpm sync:medium` to see which Medium image URLs fail
- `DEBUG_PARAGRAPH_SYNC=true pnpm sync:paragraph` to see which Paragraph image URLs fail
- Running sync with the dev server and using the image proxy (if implemented)

## File flow summary

| Mode        | Storage location | URL pattern              | Served by                          |
|-------------|------------------|--------------------------|------------------------------------|
| Local       | `public/media/`  | `/media/<filename>`      | Next.js static files               |
| R2 + custom | R2 bucket        | `https://media.domain/…` | R2 custom domain                  |
| R2 + proxy  | R2 bucket        | `/api/media/file/<filename>` | App route (reads from R2 or local) |

## Env vars reference

| Variable                      | Required for R2 | Description                                      |
|-------------------------------|-----------------|--------------------------------------------------|
| `USE_R2_STORAGE`              | Yes             | `true` to use R2 instead of local storage        |
| `R2_BUCKET`                   | Yes             | R2 bucket name                                   |
| `R2_ACCOUNT_ID`               | Yes             | Cloudflare account ID                            |
| `R2_ACCESS_KEY_ID`            | Yes             | R2 API token access key                          |
| `R2_SECRET_ACCESS_KEY`        | Yes             | R2 API token secret                              |
| `R2_ENDPOINT`                 | No              | S3 API endpoint (default from account ID)        |
| `R2_PUBLIC_HOSTNAME`          | No              | Custom domain for public R2 URLs                  |
| `R2_PUBLIC_READS`             | No              | Use direct R2 URLs (usually not publicly readable)|
| `R2_FORCE_PATH_STYLE`         | No              | S3 path-style requests (default: true)           |
| `R2_MEDIA_PREFIX`             | No              | Object key prefix (default: `media`)              |
| `NEXT_PUBLIC_USE_PAYLOAD_MEDIA_PROXY` | No      | Force Payload media proxy for all reads          |
