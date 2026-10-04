# Layout restore guide

How to put an earlier homepage layout back. Every restore writes a **draft** —
your published page is untouched until you press Publish in the admin.

---

## The three layouts

| Snapshot | Blocks | What it is |
|---|---|---|
| `home-v0-original` | 12 | **The real original.** `hero.type: highImpact`, no `heroSplit`, no `twoDoors`, no `productShowcase`. Recovered from Payload version history — published 2026-04-13. |
| `home-v1-hybrid` | 16 | **A transitional state, not a clean design.** The new blocks were added but the five legacy `content` blocks had not been deleted yet. Captured 2026-08-31. |
| `home-v2` | 11 | The target. Does not exist yet — snapshot it once you finish the migration. |

> **Read this before restoring.** `v1-hybrid` was mid-migration. If you want
> "the old site back", you almost certainly want **`v0-original`**.

### v0-original — the real previous design

```
hero.type: highImpact
ribbonBlock → statsBlock → bioBlock → content → brandLogos →
bookCoverRow → content → content → content → content → archive → cta
```

### v1-hybrid — what was published on 2026-08-31

```
hero.type: none
heroSplit → statsBlock → ribbonBlock → twoDoors → signatureTalks → bioBlock →
content ×5 → bookCoverRow → brandLogos → productShowcase → archive → cta
```

---

## Restore

Always from the repo root:

```bash
cd /Users/erinjerri/Documents/GH-Repos-Main/erinjerri-portf
```

**Back to the real original design:**

```bash
SNAPSHOT_FILE=home-v0-original.json pnpm restore:layout
```

**Back to the 31 Aug transitional state:**

```bash
SNAPSHOT_FILE=home-v1-hybrid.json pnpm restore:layout
```

**Onto a different page instead of overwriting `/home`:**

```bash
SNAPSHOT_FILE=home-v0-original.json TARGET_SLUG=home-archive pnpm restore:layout
```

Then open `http://localhost:3000/admin` → Pages → Home, review the draft, and
Publish when it looks right. Nothing is live until you do.

---

## Capture a new one

After you finish editing, freeze it:

```bash
SNAPSHOT_LABEL=v2 pnpm snapshot:layout
SNAPSHOT_FILE=home-v2.json pnpm snapshot:md
git add snapshots/ && git commit -m "chore(snapshot): capture v2 homepage layout"
git tag -a layout-v2 -m "Homepage layout v2 — legacy content blocks removed"
git push origin layout-v2
```

Other pages:

```bash
PAGE_SLUG=speaking-info SNAPSHOT_LABEL=v2 pnpm snapshot:layout
PAGE_SLUG=advisory      SNAPSHOT_LABEL=v2 pnpm snapshot:layout
```

---

## Find a version without digging through commits

```bash
git tag -l -n1          # list tags with descriptions
git checkout layout-v1  # check out that point in history
```

| Tag | Points at |
|---|---|
| `layout-v1` | The 31 Aug hybrid. **Misnamed** — kept because it is already pushed. The files it refers to are now `home-v1-hybrid.*`. |

---

## Rebuild by hand instead

Each snapshot has a `.md` next to it listing every block, the picker label you
would choose in the admin, all field values, and the copy. Rebuildable from a
clone or a zip with no database:

- `home-v0-original.md`
- `home-v1-hybrid.md`

---

## Two things that will bite you

**The `hero` field is separate from `layout`.** It renders *above* every block.
`v0-original` has `hero.type: highImpact`; the current page has `none`. Restore
scripts handle it, but if you rebuild by hand and skip the Hero tab you get
either a missing hero or two stacked heroes.

**Media is referenced by id.** Restoring into *this* database is fine. Restoring
into a different one — a fresh clone, TimeBite, FASTER — leaves image fields
empty. Text and structure survive; uploads need re-selecting.

---

## Emergency, no scripts

The snapshot JSON is plain data. Open it, find the block, copy the field values
into the admin by hand. Nothing here depends on tooling still working.
