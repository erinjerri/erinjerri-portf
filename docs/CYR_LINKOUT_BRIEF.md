# Brief: point the CYR shop pages at the real storefront

**Status:** ready to execute. Written for an agent starting cold — everything needed is below.

**Repo:** `erinjerri-portf` (this one).
**Related repo:** `cyra-site` → https://github.com/erinjerri/cyra-site/pull/10

---

## Background

The Creating Your Reality storefront now exists for real, on its own site. `cyra-site` PR #10 added:

| Route | What it is |
|---|---|
| `/shop` | Storefront landing — both products, the bundle, the planner list |
| `/pricing` | TimeBite pricing: Free / Premium monthly / Premium annual, plus a comparison table |
| `/shop/planner` | The Creating Your Reality planner's own product page |

Canonical production domain: **`https://creatingyourreality.co`**

Meanwhile, this repo has **uncommitted** work that built a *second* CYR shop on the portfolio, with its own
hardcoded copy of the prices. That is the problem this brief fixes.

**The decision, already made — do not re-litigate it:** the portfolio pages **stay** as a short teaser, so
the portfolio keeps a CYR presence. But they stop being a second storefront: the duplicated prices come out,
and every CTA points at `creatingyourreality.co`.

The principle: **prices live in exactly one place, and it is not this repo.** `cyra-site` centralises them in
`src/utilities/catalog.ts`, and the site renders them from Payload so an editor can change one without a
deploy. Any price string in this repo is a copy that will silently go stale — which is precisely how
`cyra-site` ended up quoting three different prices for the same product before PR #10 reconciled them.

---

## Current state (uncommitted, on branch `codex/ui-ribbon-quote-fix`)

```
?? src/config/creatingYourReality.ts
?? src/app/(frontend)/shop/creating-your-reality/page.tsx
?? src/app/(frontend)/shop/creating-your-reality/planner/page.tsx
 M src/Footer/Component.tsx
 M src/utilities/siteMetadata.ts
```

⚠️ **This WIP sits on a branch named for an unrelated task** (`codex/ui-ribbon-quote-fix`, about homepage
ribbons and quote contrast). Do not bundle these changes into that branch's commit. Start a new branch —
suggested: `codex/cyr-linkout`.

`src/config/creatingYourReality.ts` currently holds the duplicated numbers:

```ts
app:     { freePrice: '$0', premiumPrice: '$9.99/month', annualPrice: '$79/year',
           exploreURL: env.CYR_TIMEBITE_URL || '/timebite',
           pricingURL: env.CYR_TIMEBITE_PRICING_URL || '/timebite' }
planner: { retailPrice: '$49 target retail', status: 'Coming soon / preorder planned',
           productURL: '/shop/creating-your-reality/planner' }
bundle:  { price: '$119/year', status: 'Planned annual bundle' }
```

Note both `exploreURL` and `pricingURL` currently default to `/timebite` — a **portfolio-local** Payload page,
not the CYR site. That is the core of what needs redirecting outward.

---

## What to change

### 1. `src/config/creatingYourReality.ts` — strip prices, add a base URL

- **Delete** `app.freePrice`, `app.premiumPrice`, `app.annualPrice`, `planner.retailPrice`, `bundle.price`.
  Every one is a duplicate of a number owned by `cyra-site`.
- **Keep** `planner.status` and `bundle.status` — those are lifecycle words, not prices, and they are what
  makes the teaser honest. Do not change their wording to imply anything is purchasable.
- **Add** a single base URL, env-overridable, defaulting to the canonical domain:

  ```ts
  const CYR_SITE_URL = process.env.NEXT_PUBLIC_CYR_SITE_URL?.trim() || 'https://creatingyourreality.co'
  ```

- Rewrite the URLs against it:

  | Config key | New value |
  |---|---|
  | `app.exploreURL` | `${CYR_SITE_URL}/shop` |
  | `app.pricingURL` | `${CYR_SITE_URL}/pricing` |
  | `planner.productURL` | `${CYR_SITE_URL}/shop/planner` |
  | `bundle.url` (new) | `${CYR_SITE_URL}/pricing#bundle` |
  | `planner.updatesURL` | **unchanged** — the Substack resolver is already correct |

- **Remove** the now-unused `CYR_TIMEBITE_URL` and `CYR_TIMEBITE_PRICING_URL` reads.

### 2. `src/app/(frontend)/shop/creating-your-reality/page.tsx` — remove price display

- The `ProductRow` component takes a required `price: string` prop and renders it at line ~59. Make the prop
  **optional** and skip the `<p>` when it is absent, or drop the prop entirely — whichever reads cleaner.
- Remove the three call-site prices: `price={\`From free\`}`, `price={product.planner.retailPrice}`,
  `price={product.bundle.price}`.
- Replace the line at ~122, *"Prices are configurable and subject to change."* — it exists only to hedge
  prices that will no longer be on this page. Say where pricing actually lives instead, e.g.
  *"Pricing and availability live on creatingyourreality.co."*
- Point the bundle row's `primaryHref` at `product.bundle.url` instead of the on-page anchor `#system`.
- Leave the `<Link>` external-link handling alone: it already keys `target="_blank"` and
  `rel="noopener noreferrer"` off `href.startsWith('http')`, so absolute URLs get the right treatment for
  free. **Verify this actually fires** on every outbound CTA after the change.

### 3. `src/app/(frontend)/shop/creating-your-reality/planner/page.tsx`

Same treatment: no price strings, CTAs to `${CYR_SITE_URL}/shop/planner`. Keep it short — it is a teaser
pointing at the real product page, not a second product page.

**Do not** describe the planner as available, orderable, or shipping. It is a **concept**: not printed, no
preorder open, no date. The preorder price is undecided and must render as "to be announced" or not at all.
Never invent one.

### 4. `src/utilities/siteMetadata.ts` — fix the mangled ternary

The uncommitted diff broke the indentation of the `getFixedPageSeo` ternary chain while inserting the
`shop/creating-your-reality` branch. It still compiles — ternaries don't care about whitespace — but the
chain is now misaligned and unreadable. Re-indent it, and keep the new branch.

### 5. `.env.example` — document the new variable

`CYR_TIMEBITE_URL` was introduced by the WIP and never documented. It is being removed; document its
replacement:

```
# Base URL of the Creating Your Reality storefront. The CYR shop teaser links out to it.
# Defaults to https://creatingyourreality.co when unset.
NEXT_PUBLIC_CYR_SITE_URL=
```

### 6. `src/Footer/Component.tsx` — leave as-is

The WIP footer change already adds the Shop group and the `/shop/creating-your-reality` link, and that link
stays correct: it points at the teaser, which then points outward. No change needed, but re-read it once in
case the group-header matching is fragile.

---

## Out of scope

- **No `next.config` / `redirects.mjs` redirect.** The decision is to keep the teaser pages, so a redirect on
  `/shop/creating-your-reality*` would delete exactly what we're keeping. Only revisit if the teaser is later
  dropped.
- **No Netlify redirect rules.** Same reason.
- Do not touch anything belonging to `codex/ui-ribbon-quote-fix` (homepage ribbons, quote contrast).

---

## Verification

```bash
pnpm lint
pnpm build
```

Then check by hand:

- `grep -rn '\$9\.99\|\$79\|\$49\|\$119\|\$0' src/config src/app/\(frontend\)/shop` returns **nothing**.
- `/shop/creating-your-reality` renders, and every CTA resolves to a `creatingyourreality.co` URL.
- Every outbound link carries `target="_blank"` and `rel="noopener noreferrer"`.
- Nothing on either page claims the planner can be bought, preordered, or shipped by a date.
- The footer's Shop group still shows "Creating Your Reality".

## Commit

New branch (`codex/cyr-linkout`), separate from the ribbon/quote work. In the message, say why the prices were
removed rather than just that they were — the reason (one source of truth, in `cyra-site`) is the part a
future reader needs.
