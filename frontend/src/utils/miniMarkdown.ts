/**
 * utils/miniMarkdown.ts
 *
 * Renders the small Markdown subset the AI tutor is told to use — fenced code,
 * `inline code`, **bold**, _italic_, and "-" / "1." lists — into HTML.
 *
 * Safety: the whole input is HTML-escaped *before* any tag is added, and only
 * the fixed tags below are ever produced, so model output can't inject markup
 * even though the result is rendered with v-html.
 *
 * It also copes with half-finished input, since replies render while streaming:
 * an unclosed ``` fence is shown as code up to the end of the text.
 */

const escapeHtml = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const renderInline = (text: string) =>
  text
    .replace(/`([^`\n]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])_([^_\n]+)_(?=[\s).,!?:;]|$)/g, '$1<em>$2</em>')

/** Paragraphs and lists for a run of text that contains no code fences. */
const renderBlocks = (text: string) => {
  const html: string[] = []
  let list: { tag: 'ul' | 'ol'; items: string[] } | null = null
  let paragraph: string[] = []

  const flushParagraph = () => {
    if (paragraph.length) html.push(`<p>${paragraph.map(renderInline).join('<br>')}</p>`)
    paragraph = []
  }
  const flushList = () => {
    if (list) html.push(`<${list.tag}>${list.items.map((i) => `<li>${renderInline(i)}</li>`).join('')}</${list.tag}>`)
    list = null
  }

  for (const line of text.split('\n')) {
    const bullet = line.match(/^\s*[-*]\s+(.*)$/)
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/)
    const item = bullet || numbered
    if (item) {
      const tag = bullet ? 'ul' : 'ol'
      flushParagraph()
      if (list && list.tag !== tag) flushList()
      if (!list) list = { tag, items: [] }
      list.items.push(item[1])
    } else if (!line.trim()) {
      flushParagraph()
      flushList()
    } else {
      flushList()
      paragraph.push(line)
    }
  }
  flushParagraph()
  flushList()
  return html.join('')
}

export function renderMiniMarkdown(source: string): string {
  const parts = escapeHtml(source).split('```')
  return parts
    .map((part, i) => {
      // Odd parts sit between fences. The first line is the language tag, if any.
      if (i % 2 === 0) return renderBlocks(part)
      const code = part.replace(/^[\w+-]*\n/, '')
      return `<pre><code>${code.replace(/\n$/, '')}</code></pre>`
    })
    .join('')
}
