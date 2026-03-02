# Templatizing This Repo

Use this guide **after** you’ve set up the Payload dashboard with analytics widgets. It walks through turning this project into a reusable template.

---

## Part 1: Add Payload Dashboard Widgets (Do This First)

### 1.1 Create an analytics widget

1. Create `src/components/AdminDashboard/AnalyticsWidget.tsx`:

```tsx
import type { WidgetServerProps } from 'payload'

export default async function AnalyticsWidget({ req }: WidgetServerProps) {
  const { payload } = req

  // Example: count documents
  const [posts, pages, media] = await Promise.all([
    payload.count({ collection: 'posts' }),
    payload.count({ collection: 'pages' }),
    payload.count({ collection: 'media' }),
  ])

  return (
    <div className="card">
      <h3>Content Overview</h3>
      <ul>
        <li>Posts: {posts.totalDocs}</li>
        <li>Pages: {pages.totalDocs}</li>
        <li>Media: {media.totalDocs}</li>
      </ul>
    </div>
  )
}
```

2. Register the widget in `src/payload.config.ts`:

```ts
admin: {
  dashboard: {
    widgets: [
      {
        slug: 'analytics',
        ComponentPath: '@/components/AdminDashboard/AnalyticsWidget#default',
        minWidth: 'small',
        maxWidth: 'medium',
      },
    ],
    defaultLayout: () => [
      { widgetSlug: 'collections', width: 'full' },
      { widgetSlug: 'analytics', width: 'medium' },
    ],
  },
  // ... rest of admin config
},
```

3. For richer analytics (charts, external APIs), follow the [Payload Dashboard docs](https://payloadcms.com/docs/custom-components/dashboard) and the [YouTube walkthrough](https://www.youtube.com/watch?v=fXF34Ef6G84).

---

## Part 2: Templatize the Repo

### 2.1 Sanitize project-specific content

| What to change | Where | Action |
|----------------|-------|--------|
| `package.json` `name` | `package.json` | Set to `"payload-portfolio-template"` or similar |
| `package.json` `description` | `package.json` | Update for template use |
| `.env.example` | Create if missing | Add required vars; never commit real `.env` |
| `README.md` | Root | Update for template users (env vars, deploy steps) |
| Favicon / logo | `public/` | Replace with generic or placeholder |
| Seed content | `src/scripts/restore.ts`, seed data | Use generic demo content |
| `metadata.twitter.creator` | `src/app/(frontend)/layout.tsx` | Use placeholder like `@yourhandle` |
| Brand global | Payload admin | Document that users should update via admin |

### 2.2 Ensure `.env.example` exists

Create `.env.example` with placeholders (no real secrets):

```env
# Required
PAYLOAD_SECRET=your-secret-here
DATABASE_URL=mongodb+srv://...
NEXT_PUBLIC_SERVER_URL=https://your-site.com

# Optional
ALLOW_SEED_IN_PROD=false
EMAIL_VERIFY_TRANSPORT=false
PROTON_SMTP_USER=
PROTON_SMTP_TOKEN=
USE_R2_STORAGE=false
R2_BUCKET=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_PUBLIC_HOSTNAME=
```

### 2.3 Remove or anonymize sensitive data

- Delete any `.env` or `.env.local` from the repo (they should be in `.gitignore`)
- Remove personal API keys, tokens, or credentials
- Replace real URLs in seed data with placeholders
- Strip analytics IDs or tracking codes if they’re project-specific

### 2.4 GitHub template setup

1. Push your changes to GitHub.
2. Open the repo → **Settings** → **General**.
3. Enable **Template repository**.
4. Users can then click **Use this template** to create a new repo from it.

### 2.5 Optional: `degit` for CLI templating

If you prefer CLI-based templating:

```bash
npx degit your-username/erinjerri-portf my-new-project
cd my-new-project
pnpm install
cp .env.example .env
# Edit .env with real values
pnpm dev
```

---

## Part 3: Post-templatize checklist

- [ ] Payload dashboard widgets (including analytics) are in place
- [ ] `package.json` name/description updated
- [ ] `.env.example` created and documented
- [ ] README updated for template users
- [ ] No secrets or personal data in the repo
- [ ] GitHub “Template repository” enabled
- [ ] Run `pnpm dev` and `pnpm build` to confirm everything works
