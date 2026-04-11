type LexicalNode = {
  text?: string | null
  children?: LexicalNode[]
}

/** True when Lexical richText has visible text (ignores empty paragraphs). */
export function richTextHasContent(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  const root = (value as { root?: { children?: LexicalNode[] } }).root
  if (!root || !Array.isArray(root.children)) return false

  const walk = (nodes: LexicalNode[]): boolean =>
    nodes.some((n) => {
      if (!n || typeof n !== 'object') return false
      if (typeof n.text === 'string' && n.text.trim().length > 0) return true
      return Array.isArray(n.children) && walk(n.children)
    })

  return walk(root.children)
}
