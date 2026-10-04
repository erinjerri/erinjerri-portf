# Codex prompt — automate the CMS content pipeline

Paste everything below the line into Codex.

---

You are working in `erinjerri/erinjerri-portf` — a Payload CMS 3 + Next.js 15 site on MongoDB Atlas.

## The problem

An audit found that the React block components are done and merged, but there is **no
pipeline that gets copy into the database**. Every content change currently requires a
human pasting text into the Payload admin, block by block. Your job is to build that
pipeline. Do not redesign the blocks.

## Verified facts — treat these as given, do not re-derive

- Seed files under `src/endpoints/seed/` **never run**. They execute only via `pnpm seed`
  or `POST /next/seed`, and the latter is gated by `ALLOW_SEED_IN_PROD` in
  `src/app/(frontend)/next/seed/route.ts:10`. Neither runs on build or deploy.
- The seed and the database have **diverged completely**. `speaking-info-page.ts` defines
  7 blocks; the live `/speaking-info` page has 2 (`content`, `formBlock`) sharing no text
  with the seed. Editing that seed file changes nothing a visitor sees.
- The live homepage has **18 blocks**; the intended v2 layout is **12**. Extra blocks:
  one duplicate `statStrip` and five legacy `content` blocks.
- These fields still hold v1 copy in the database: `ribbonBlock.headline`,
  `bioBlock` (8 paragraphs), `signatureTalks` talk 02 title, `archive.introContent`,
  `cta.richText`. Only `twoDoors` has v2 copy.
- There are **zero custom Payload admin components** in this repo. Grep for `components:`
  across `src/blocks/*/config.ts`, `src/collections/`, `src/fields/` returns nothing.
  `src/app/(payload)/admin/importMap.js` contains no block components.
  `src/app/(payload)/custom.scss` is 0 bytes.
- Brand palette lives in `src/utilities/brandAccents.ts`. Do not introduce new colors,
  gradients, or gold.

## Hard constraints — violating any of these is a failed task

1. **Local dev connects to the production Atlas database.** Every write must pass
   `draft: true` and `context: { disableRevalidate: true }`. Never call `publish`.
   Never set `_status: 'published'`.
2. **Never delete a block without an explicit opt-in flag and a snapshot taken first.**
3. **Never run or recommend `pnpm seed` against production.** It would overwrite live
   pages with stale seed data.
4. Every script must support `DRY_RUN=1` that prints the exact diff it *would* write and
   exits without touching the database. Default to dry-run when the flag is absent is
   acceptable and preferred for the destructive one.
5. Every script must be **idempotent** — running it twice produces the same result.
6. TypeScript strict. `pnpm build` and `tsc --noEmit` must pass.

## Deliverables

### 1. `src/content/home-v2.ts` — copy as data, not as prose in a script

A typed module exporting the v2 copy for the homepage, keyed by `blockType` and, where a
page has more than one block of a type, by `blockName`. Rich-text fields should be
authored as plain strings or a small `{ heading, paragraphs }` shape, with a helper that
converts to Lexical — not as hand-written Lexical JSON. Read the existing Lexical shapes
in `src/endpoints/seed/speaking-info-page.ts` to match the node structure exactly
(`type`, `version`, `direction`, `format`, `indent`, `textFormat` are all required).

Source the actual v2 copy from `snapshots/page-layouts/home-v1-hybrid.md` for structure,
and leave clearly-marked `TODO(copy)` placeholders for any field where you cannot
determine the intended v2 text. Do not invent marketing copy.

### 2. `src/scripts/apply-copy.ts` — the pipeline that was missing

```
DRY_RUN=1 PAGE_SLUG=home pnpm apply:copy    # print diff, write nothing
PAGE_SLUG=home pnpm apply:copy              # write as draft
```

Behavior:
- Loads the page by slug with `draft: true, depth: 0, overrideAccess: true`.
- Matches each block in the live layout to an entry in the content module.
- **Only updates fields present in the content module.** Any field not named there is
  passed through untouched. Never drops a block, never reorders.
- Prints a per-field diff (`old → new`, truncated to 120 chars) before writing.
- Reports unmatched content entries (copy with nowhere to go) and unmatched blocks
  (blocks with no copy defined) as warnings, not errors.
- Writes once, as a draft, with `disableRevalidate`.

Add the `apply:copy` script to `package.json`.

### 3. `src/scripts/prune-blocks.ts` — the only script allowed to remove anything

```
DRY_RUN=1 PAGE_SLUG=home pnpm prune:blocks
CONFIRM_DELETE=1 PAGE_SLUG=home pnpm prune:blocks
```

- Refuses to run without `CONFIRM_DELETE=1`; prints the plan and exits otherwise.
- Before any write, invokes the existing snapshot logic in
  `src/scripts/snapshot-page-layout.ts` (extract it into a reusable function rather than
  shelling out) and writes `snapshots/page-layouts/<slug>-pre-prune-<ISO date>.json`.
- Removes blocks by **index**, from a list the operator passes explicitly
  (`PRUNE_INDEXES=2,8,9,10,11,12`), not by `blockType` — types repeat and matching by
  type is how you delete the wrong thing.
- Prints each block it will remove with its index, `blockType`, `blockName`, and the
  first 80 characters of its text content, so the operator can verify before confirming.
- Writes as a draft.

### 4. Make the admin block list readable

The single biggest reason this work is manual is that the Payload admin shows a column of
collapsed rows all labeled `Content`, `Content`, `Content`. Fix that:

- Add `admin.components.RowLabel` to the `content`, `statStrip`, `tagPills`,
  `signatureTalks`, and `ribbonBlock` block configs so each collapsed row shows its
  actual first heading or first item, not the block type.
- Follow the pattern already in `@/Header/RowLabel` — that is the one existing RowLabel in
  this repo and it is already registered in the import map.
- Regenerate the import map (`pnpm payload generate:importmap`) and commit the result.
- Add a one-line `admin.description` to each of the same blocks saying what it renders and
  where it is used.

This is the only change in this task that touches the admin UI. Keep it to labels and
descriptions — no custom field editors, no admin CSS.

### 5. Seed/database parity

Pick one and do it consistently across all files in `src/endpoints/seed/`:
- **Preferred:** regenerate each stale seed from the live database using the existing
  `snapshot-page-layout.ts` output, so the seed matches reality; or
- delete the stale seed entirely if the page it describes no longer exists in that form.

Either way, add a header comment to `src/endpoints/seed/index.ts` stating in one sentence
that seeds do not run automatically and are for fresh-database bootstrap only.

### 6. One correctness bug found during the audit

`src/components/Media/ImageMedia/index.tsx` defines
`ALLOWED_QUALITIES = [60, 65, 70, 75, 80, 85, 90, 100]`, but `next.config.mjs` allows
`[60, 65, 70, 75, 80, 82, 85, 90, 100]`. A caller passing `quality={82}` silently falls
back to 70. Make the two lists share a single exported constant so they cannot drift.

## What NOT to do

- Do not modify `src/payload.config.ts`.
- Do not add a custom block editor, live-preview component, or admin theme.
- Do not touch `next.config.mjs` beyond the quality-list import in item 6.
- Do not rewrite the React block components.
- Do not add dependencies.
- Do not write marketing copy. Use `TODO(copy)` and say so in your summary.

## Definition of done

- `DRY_RUN=1 PAGE_SLUG=home pnpm apply:copy` prints a readable field-level diff and makes
  no database write.
- `pnpm build` and `pnpm tsc --noEmit` pass.
- The Payload admin's Layout list shows distinguishable row labels instead of six rows
  reading `Content`.
- Your summary lists, per file: what changed, and whether it affects the **admin UI**,
  the **frontend**, or the **database** — those three categories, explicitly, for every
  file you touch.
