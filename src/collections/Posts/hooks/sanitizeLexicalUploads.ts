import type { CollectionAfterReadHook } from 'payload'

/**
 * Heuristic: request is likely from the admin panel (editing a document).
 * We only sanitize for admin to avoid breaking frontend rendering which needs populated media.
 */
function isLikelyAdminRequest(req: { headers?: { get?: (name: string) => string | null }; url?: string } | null): boolean {
  if (!req) return false
  const referer = req.headers?.get?.('referer') ?? req.headers?.get?.('Referer')
  if (referer && (referer.includes('/admin') || referer.includes('/admin/'))) return true
  if (req.url && (req.url.includes('/admin') || req.url.includes('/api/posts/'))) return true
  return false
}

/**
 * Sanitize Lexical content so upload nodes have ID-only values.
 * When documents are fetched with depth > 0, upload nodes get populated objects
 * instead of IDs, causing "Upload value should be a string or number" errors.
 * This hook normalizes the data so the admin editor can load and be edited.
 * Only runs for admin requests to avoid breaking frontend rendering.
 */
function sanitizeNode(node: Record<string, unknown>): Record<string, unknown> {
  if (!node || typeof node !== 'object') return node

  const result = { ...node }

  if (result.type === 'upload' && result.value != null) {
    const val = result.value
    if (typeof val === 'object' && val !== null && 'id' in val && typeof (val as { id?: unknown }).id === 'string') {
      result.value = (val as { id: string }).id
    }
  }

  if (Array.isArray(result.children)) {
    result.children = result.children.map((child: unknown) =>
      typeof child === 'object' && child !== null ? sanitizeNode(child as Record<string, unknown>) : child,
    )
  }

  if (result.fields && typeof result.fields === 'object') {
    const fields = result.fields as Record<string, unknown>
    if (fields.value != null && typeof fields.value === 'object' && fields.value !== null && 'id' in fields.value) {
      const id = (fields.value as { id?: unknown }).id
      if (typeof id === 'string') {
        ;(result.fields as Record<string, unknown>).value = id
      }
    }
  }

  return result
}

function sanitizeLexicalContent(content: unknown): unknown {
  if (!content || typeof content !== 'object') return content
  const root = (content as { root?: unknown }).root
  if (!root || typeof root !== 'object') return content

  const result = { ...(content as Record<string, unknown>) }
  result.root = sanitizeNode(root as Record<string, unknown>)
  return result
}

export const sanitizeLexicalUploads: CollectionAfterReadHook = ({ doc, req }) => {
  if (!doc || typeof doc !== 'object') return doc
  if (!isLikelyAdminRequest(req)) return doc

  const result = { ...doc }

  if (result.content && typeof result.content === 'object') {
    result.content = sanitizeLexicalContent(result.content)
  }

  return result
}
