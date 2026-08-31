# Page layout snapshots

Frozen copies of CMS page layouts. Payload's version history is **not** an
archive here — `maxPerDoc` is 50 and dev autosave fires every 15s, so an
editing session can push an old layout off the bottom in minutes. These files
are committed to git and survive the cap, a bad publish, and the database.

Every layout has two files:

| File | For |
|---|---|
| `<page>-<label>.json` | machine-restorable — feeds `restore:layout` |
| `<page>-<label>.md` | human-readable — block order, picker labels, all copy |

## Capture

```bash
pnpm snapshot:layout                                        # home, dated label
SNAPSHOT_LABEL=v2 pnpm snapshot:layout                      # named label
PAGE_SLUG=advisory SNAPSHOT_LABEL=v1 pnpm snapshot:layout   # another page
```

Read-only against Payload.

## Generate the readable manifest

```bash
SNAPSHOT_FILE=home-v1.json pnpm snapshot:md
```

Pure file transform. Never touches Payload.

## Restore

```bash
SNAPSHOT_FILE=home-v1.json pnpm restore:layout                          # back onto /home
SNAPSHOT_FILE=home-v1.json TARGET_SLUG=home-archive pnpm restore:layout # onto another page
```

Always writes as a **draft**. The published page is untouched until you hit
Publish in the admin. Restores the `hero` field as well as `layout`, because
`hero` renders above every block and is easy to forget.

## Limitation

Media is referenced by id. Restoring into a database with different media ids
leaves image fields empty — the copy and structure survive, the uploads need
re-selecting. Text is fully portable; images are not.

## Versions

Tagged in git so you don't have to hunt commit hashes:

| Tag | What |
|---|---|
| `layout-v1` | Homepage before the block migration — 16 blocks, five legacy `content` duplicates still present |
