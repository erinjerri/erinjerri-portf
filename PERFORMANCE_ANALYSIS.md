# Performance Analysis

Analysis run: build + codebase review. Focus: slow build, slow nav clicks, slow images.

---

## Lighthouse mobile (Moto G Power, slow 4G, Lighthouse 13) — Apr 2026

### Before (production audit excerpt)

| Metric | Value |
|--------|------:|
| Performance | red zone |
| FCP | 1.1 s |
| LCP | 3.8 s |
| TBT | ~31 s cumulative blocking (lab) |
| CLS | 0.465 |
| SI | 6.3 s |

Notable audits: footer + flex column layout shift; hero/headshot images oversized vs display; legacy polyfills in large chunks; Clarity early; unused JS; large DOM.

### After (expected / re-measure on Netlify)

| Metric | Target |
|--------|--------|
| LCP | under 2.5 s (target) — tighter `sizes` + quality on hero `Media`, Next image optimization |
| CLS | under 0.1 (target) — footer subscribe reserve height, `contain:paint`, dynamic subscribe skeleton |
| TBT | under 200 ms (target) — `optimizePackageImports`, deferred Clarity post-LCP, smaller hero bytes |

**Re-run locally:** `pnpm build && pnpm start`, then Lighthouse mobile against `http://localhost:3000`. **Re-run on Netlify** after deploy (CDN headers + plugin).

---

---

## Build Timing (observed)

| Phase | Time |
|-------|------|
| Webpack compile | ~74s |
| Collecting page data | ~90s (7 workers) |
| Generating static pages | 3.6s (39 pages) |
| **Total** | **~170s** |

---

## 1. Build Slowness

### Payload initialization overhead
- Payload + MongoDB initializes **8+ times** during "Collecting page data" (one per worker).
- Each worker logs: DB env, media storage mode, etc.
- **Impact**: Repeated connection setup and config loading.

### generateStaticParams
- Runs for: `pages`, `posts`, `projects`, `watch`, plus pagination routes.
- Each does a `payload.find()` with `limit: 1000`.
- **Impact**: 5+ DB queries before static generation.

### Webpack
- `cache: { type: 'memory' }` in dev only; prod uses default.
- Bundle analyzer reports saved to `.next/analyze/` (client, nodejs, edge).
- **Suggestion**: Run `ANALYZE=true pnpm build` and open `.next/analyze/client.html` to find large bundles.

---

## 2. Nav Click Slowness (dev)

### Layout re-fetches on every navigation
The root layout is async and fetches on **every request**:

```
Layout
├── draftMode()           ← async
├── Header                ← getCachedGlobal('header', 1)  → Payload findGlobal
├── Footer                ← getCachedGlobal('footer', 2)  → Payload findGlobal
│   └── + payload.find()  ← extra DB call for social icon media
└── children
```

- In **dev**, `unstable_cache` is request-scoped (no cross-request cache).
- So each nav click → full layout re-render → Header + Footer both hit the DB again.
- **Impact**: 3+ async operations (draftMode, header, footer + media) before the page can render.

### Footer double fetch
- `getCachedGlobal('footer', 2)` fetches the footer global.
- A separate `payload.find({ collection: 'media', where: { id: { in: [...] } } })` resolves social icon IDs.
- **Impact**: Two sequential DB round-trips for the footer on every request.

### Page-level fetches
- Each page (e.g. `[slug]`, `posts/[slug]`) does its own `getPageBySlug` / `getPostBySlug`.
- `generateMetadata` runs separately and can duplicate the same fetch.
- **Impact**: Extra DB work per page, especially when metadata and page data both run.

---

## 3. Image Slowness

### Media proxy
- `forcePayloadMediaProxy: true` → images served via `/api/media/file/[filename]`.
- Each image request: API route → S3/R2 `GetObject` → buffer full body → return.
- **Impact**: Every image is a server round-trip + R2 fetch; no direct CDN.

### Hero / above-the-fold images
- `HighImpactHero`, `VideoBackgroundTransition`, `PostHero` use `priority` on `Media`.
- `priority` disables lazy loading and loads images eagerly.
- **Impact**: Multiple priority images on one page increase initial load and proxy traffic.

### next/image optimization
- `localPatterns` includes `/api/media/file/**` → Next.js may fetch proxied media during SSG.
- Comment in config: "allowing it causes Next.js to fetch proxied media during static generation which multiplies network requests and slows builds."
- **Impact**: Build-time image optimization can trigger many proxy requests.

---

## 4. Recommendations

### Quick wins

| Change | Effect |
|--------|--------|
| **Dev: `NEXT_PUBLIC_USE_PAYLOAD_MEDIA_PROXY=false`** | Use `dev:fast` script; images load from R2/CDN directly, fewer proxy fetches. |
| **Footer: resolve icons in global** | Add social icon media to footer global (e.g. `depth: 2` on `socialLinks.icon`) to avoid the extra `payload.find`. |
| **Parallel layout fetches** | Run Header and Footer fetches in parallel (e.g. `Promise.all`) instead of sequentially. |

### Medium effort

| Change | Effect |
|--------|--------|
| **`getCachedGlobal` revalidate** | Add `revalidate: 60` (or similar) so prod caches header/footer. |
| **Dedupe metadata fetch** | Reuse page/post data in `generateMetadata` instead of fetching again (e.g. pass from page or use a shared cache). |
| **R2 direct URLs in prod** | If R2 is public, set `R2_PUBLIC_HOSTNAME` and use direct URLs to avoid proxy for most images. |

### Deeper changes

| Change | Effect |
|--------|--------|
| **Static layout data** | If header/footer rarely change, consider ISR or longer revalidate for globals. |
| **Route prefetch** | Use `prefetch={false}` on non-critical `Link`s to reduce prefetch work (trade-off: slower first nav). |
| **Bundle analysis** | Inspect `.next/analyze/client.html` for heavy deps (e.g. `prism-react-renderer`, `@react-three/*`, Lexical). |
| **Build: Turbopack** | Try `pnpm build:turbo` to see if Turbopack speeds up dev/build. |

---

## 5. Scripts Reference

```bash
# Dev with media proxy (default) – images via /api/media/file
pnpm dev

# Dev without proxy – images from R2/CDN directly (faster)
pnpm dev:fast

# Build with bundle analyzer
ANALYZE=true pnpm build
# Then open: .next/analyze/client.html

# Build with Turbopack (experimental)
pnpm build:turbo
```

---

## 6. Files to Inspect

| File | Purpose |
|------|---------|
| `src/app/(frontend)/layout.tsx` | Layout, draftMode, Header, Footer |
| `src/Header/Component.tsx` | Header data fetch |
| `src/Footer/Component.tsx` | Footer data fetch + media lookup |
| `src/utilities/getGlobals.ts` | getCachedGlobal, no revalidate |
| `src/app/api/media/file/[filename]/route.ts` | Media proxy (buffers S3/R2) |
| `src/utilities/getMediaUrl.ts` | URL resolution, R2 vs proxy |
| `next.config.mjs` | images.localPatterns, webpack cache |
