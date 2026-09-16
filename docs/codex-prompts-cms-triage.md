# Three Codex prompts — CMS content triage

Run in order. All three are read-only audits. None writes to the database.

Shared context to paste at the top of each:

> Repo: Payload CMS 3 + Next.js 15, MongoDB Atlas. Local dev connects to the
> PRODUCTION database — this task is READ-ONLY. Do not write, publish, or run
> `pnpm seed`. Use `payload.find({ depth: 0, overrideAccess: true })` only.
> Blocks live in `src/blocks/*/{config.ts,Component.tsx}`. Layout snapshots are
> in `snapshots/page-layouts/`. Seed files in `src/endpoints/seed/` DO NOT RUN
> automatically — they are gated by `ALLOW_SEED_IN_PROD` and are not a source of
> truth for what is live.

---

## Prompt 1 — What is actually in the CMS right now

Audit what is live in the database, and whether each block renders what its config promises.

For every page in the `pages` collection, output a table:

| Page | # | blockType | blockName | First 80 chars of visible text |

Then, for each distinct `blockType` present, do a **fidelity check**. Read the block's
`config.ts` and its `Component.tsx` side by side and report:

- Fields defined in `config.ts` that `Component.tsx` never reads — an editor can fill
  these in and nothing happens.
- Values hardcoded in `Component.tsx` that a config field should control — headings,
  colors, column counts, labels, spacing.
- Responsive behavior that changes what the editor sees vs. what they configured.
  Example already found: `statStrip` has a `columns: 'four'` config field, but
  `Component.tsx` renders `grid-cols-2 lg:grid-cols-4`, so below 1024px it is always 2
  columns regardless of the setting. Find every instance of this pattern.
- Any block where two adjacent instances in the same page are near-duplicates.

Rank the blocks worst-first by how far the rendered output can diverge from what the
editor configured. That ranking is the deliverable — it tells me which blocks are safe
to fill in and which will waste my time.

Do not fix anything. Report only, with `file:line` evidence.

---

## Prompt 2 — What is missing and should be scripted in

Find copy that exists somewhere in this repo but is NOT in the live database, and tell me
which parts a script can apply.

Sources to diff against the live database:
- `snapshots/page-layouts/*.md` and `*.json`
- `src/endpoints/seed/*.ts`
- any mock or draft copy in `docs/`

Output one table:

| Page | Block | Field | Live value (truncated) | Intended value (truncated) | Source file | Scriptable? |

For the `Scriptable?` column use exactly one of:
- **YES** — plain scalar field (string, number, select). A script can set it safely.
- **YES-LEXICAL** — rich text. Scriptable, but requires generating correct Lexical nodes;
  note which existing file has the correct node shape to copy.
- **NO-MEDIA** — the field is an upload relationship. Media is referenced by ObjectId, so
  this needs a human picking the file in the admin.
- **NO-STRUCTURE** — requires adding, deleting, or reordering blocks, not editing a field.

Then give me two counts: how many rows are scriptable, and how many are not. If the
scriptable count is under 20, say so plainly — it may not be worth building tooling for.

Also flag any place where the seed file and the live database have diverged so far that
the seed is misleading rather than useful. Recommend delete-or-regenerate for each.

Do not write any code. Report only.

---

## Prompt 3 — What I actually have to do by hand

Given the output of prompts 1 and 2, produce the irreducible manual checklist — the work
no script can do, ordered so I can sit in the Payload admin once and finish it.

Group by admin navigation path, in the order I would click through:

```
Collections → Pages → Home → Layout
Collections → Pages → Speaking → Layout
Globals → Header
Globals → Footer
```

For each item give me exactly four things:
1. The block position and name as it appears in the collapsed Layout list.
2. The field label as it appears in the admin form.
3. The exact value to enter, in full — not a summary, not "update the heading".
4. Why a script cannot do it (media ObjectId, block reordering, block deletion, or the
   copy does not exist anywhere yet).

Then, separately, list every field where the intended copy **does not exist anywhere in
this repo** — where I have to write it myself. Mark these `NEEDS COPY` and give me the
character count of the current value so I know the length to write to.

Finally: estimate how long the whole checklist takes at 90 seconds per field, and tell me
whether any block from Prompt 1's worst-first ranking should be fixed in code before I
bother filling it in. I would rather fix a broken block than paste into it twice.
