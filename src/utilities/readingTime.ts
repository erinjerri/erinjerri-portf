/**
 * Extracts plain text from Lexical editor state and calculates estimated reading time.
 * Average reading speed: 238 words per minute (based on research).
 */

const WORDS_PER_MINUTE = 238

interface LexicalNode {
  type: string
  children?: LexicalNode[]
  text?: string
  [key: string]: unknown
}

interface LexicalContent {
  root?: LexicalNode
}

function extractText(node: LexicalNode): string {
  let text = ''

  if (node.text) {
    text += node.text + ' '
  }

  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      text += extractText(child)
    }
  }

  return text
}

export function getReadingTime(content: LexicalContent | undefined | null): {
  minutes: number
  words: number
  text: string
} {
  if (!content?.root) {
    return { minutes: 0, words: 0, text: '0 min read' }
  }

  const plainText = extractText(content.root).trim()
  const words = plainText.split(/\s+/).filter((word) => word.length > 0).length
  const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))

  return {
    minutes,
    words,
    text: `${minutes} min read`,
  }
}
