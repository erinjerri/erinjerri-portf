import './loadEnv'

import fs from 'fs'
import path from 'path'

/**
 * Turns a layout snapshot JSON into a human-readable Markdown manifest.
 *
 * The JSON is the machine-restorable copy; this is the one you read. For every
 * block it records the picker label you would choose in the admin, the field
 * values, and the flattened rich text, so the layout can be rebuilt by hand
 * from a clone or a zip with no database access.
 *
 * Pure file transform — never touches Payload.
 *
 *   pnpm snapshot:md                                    # home-v1
 *   SNAPSHOT_FILE=advisory-v1.json pnpm snapshot:md
 */

const DIR = path.resolve(process.cwd(), 'snapshots/page-layouts')
const FILE = process.env.SNAPSHOT_FILE?.trim() || 'home-v1.json'

/** Admin picker labels, so the manifest names what you'd actually click. */
const PICKER_LABELS: Record<string, string> = {
  archive: 'Archive',
  affiliateProductsBlock: 'Affiliate Products',
  bioBlock: 'Bio',
  bookAcclaimStrip: 'Book acclaim strip',
  bookCoverRow: 'Book cover row',
  brandLogos: 'Brand logos',
  content: 'Content',
  cta: 'Call to Action',
  documentBlock: 'Document',
  formBlock: 'Form',
  heroCredentialStrip: 'Hero credential strip',
  heroSplit: 'Hero (split)',
  mediaBlock: 'Media',
  productShowcase: 'Product showcase',
  ribbonBlock: 'Ribbon',
  signatureTalks: 'Signature talks',
  speakerBio: 'Speaker bio',
  speakerKit: 'Speaker kit',
  speakerKitHeadshots: 'Speaker kit headshots',
  statStrip: 'Stat strip',
  statsBlock: 'Stats',
  tagPills: 'Tag pills',
  toplineHeader: 'Topline header',
  twoDoors: 'Two doors',
  videoBackgroundTransition: 'Video background transition',
  watchBlock: 'Watch',
}

type Node = { text?: string; children?: Node[] }

/** Flatten Lexical rich text to plain paragraphs. */
function flattenRichText(value: unknown): string[] {
  const root = (value as { root?: { children?: Node[] } })?.root
  if (!root?.children) return []
  const out: string[] = []
  const walk = (n: Node): string => {
    const own = typeof n.text === 'string' ? n.text : ''
    const kids = Array.isArray(n.children) ? n.children.map(walk).join('') : ''
    return own + kids
  }
  for (const child of root.children) {
    const line = walk(child).trim()
    if (line) out.push(line)
  }
  return out
}

const SKIP_KEYS = new Set(['blockType', 'blockName', 'id', 'columns', 'richText'])

function scalarFields(block: Record<string, unknown>): string[] {
  const rows: string[] = []
  for (const [k, v] of Object.entries(block)) {
    if (SKIP_KEYS.has(k)) continue
    if (v == null || v === '') continue
    if (Array.isArray(v)) {
      if (v.length === 0) continue
      rows.push(`- **${k}** — ${v.length} item(s)`)
      v.slice(0, 12).forEach((item, i) => {
        if (item && typeof item === 'object') {
          const parts = Object.entries(item as Record<string, unknown>)
            .filter(([kk, vv]) => kk !== 'id' && vv != null && vv !== '' && typeof vv !== 'object')
            .map(([kk, vv]) => `${kk}: ${String(vv)}`)
          if (parts.length) rows.push(`  ${i + 1}. ${parts.join(' · ')}`)
        } else {
          rows.push(`  ${i + 1}. ${String(item)}`)
        }
      })
      continue
    }
    if (typeof v === 'object') {
      rows.push(`- **${k}** — \`${JSON.stringify(v).slice(0, 90)}\``)
      continue
    }
    rows.push(`- **${k}** — ${String(v)}`)
  }
  return rows
}

function run(): void {
  const src = path.join(DIR, FILE)
  if (!fs.existsSync(src)) {
    throw new Error(`Snapshot not found: ${path.relative(process.cwd(), src)}`)
  }

  const snap = JSON.parse(fs.readFileSync(src, 'utf8'))
  const layout: Record<string, unknown>[] = snap.layout ?? []

  const md: string[] = []
  md.push(`# ${snap.title} — layout \`${snap.label}\``)
  md.push('')
  md.push(`**Page:** \`/${snap.slug}\`  `)
  md.push(`**Captured:** ${snap.capturedAt}  `)
  md.push(`**Status at capture:** ${snap.status}  `)
  md.push(`**Blocks:** ${layout.length}  `)
  md.push(`**Hero field:** \`${(snap.hero as { type?: string })?.type ?? 'none'}\` — renders *above* all layout blocks`)
  md.push('')
  md.push('Rebuild by adding each block in this order and filling the fields below.')
  md.push(`Machine-restorable copy: \`snapshots/page-layouts/${FILE}\``)
  md.push('')
  md.push('## Block order')
  md.push('')
  md.push('| # | Picker label | blockType | Name in admin |')
  md.push('|---|---|---|---|')
  layout.forEach((b, i) => {
    const t = String(b.blockType ?? '')
    md.push(`| ${String(i + 1).padStart(2, '0')} | ${PICKER_LABELS[t] ?? '—'} | \`${t}\` | ${b.blockName ?? '—'} |`)
  })
  md.push('')
  md.push('---')
  md.push('')

  layout.forEach((b, i) => {
    const t = String(b.blockType ?? '')
    md.push(`## ${String(i + 1).padStart(2, '0')} — ${PICKER_LABELS[t] ?? t}`)
    md.push('')
    md.push(`\`${t}\`${b.blockName ? ` · named **${b.blockName}**` : ''}`)
    md.push('')

    const fields = scalarFields(b)
    if (fields.length) {
      md.push('**Fields**')
      md.push('')
      md.push(...fields)
      md.push('')
    }

    const cols = b.columns as Record<string, unknown>[] | undefined
    if (Array.isArray(cols) && cols.length) {
      cols.forEach((c, ci) => {
        const lines = flattenRichText(c.richText)
        const link = c.link as Record<string, unknown> | undefined
        if (!lines.length && !link?.label) return
        md.push(`**Column ${ci + 1}**${c.size ? ` — size \`${c.size}\`` : ''}`)
        md.push('')
        lines.forEach((l) => md.push(`> ${l}`))
        if (link?.label) md.push(`> \n> **Link:** ${link.label} → ${link.url ?? '(reference)'}`)
        md.push('')
      })
    }

    const direct = flattenRichText(b.richText)
    if (direct.length) {
      md.push('**Rich text**')
      md.push('')
      direct.forEach((l) => md.push(`> ${l}`))
      md.push('')
    }

    md.push('---')
    md.push('')
  })

  const out = path.join(DIR, FILE.replace(/\.json$/, '.md'))
  fs.writeFileSync(out, md.join('\n'))
  console.log(`Manifest written: ${path.relative(process.cwd(), out)}`)
  console.log(`  ${layout.length} blocks documented`)
}

try {
  run()
  process.exit(0)
} catch (error) {
  console.error(error)
  process.exit(1)
}
