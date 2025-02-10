import { PageHeader } from "vuepress"
import MarkdownIt from "markdown-it"

export function htmlDecode(input: string): string {
  return input.replace("&#39;", "'")
    .replace("&amp;", "&")
    .replace("&quot;", '"')
}

export function fixPageHeader(header: PageHeader) {
  header.title = htmlDecode(header.title)
  header.children.forEach(child => fixPageHeader(child))
}

export function mermaidCodeFencePlugin(md: MarkdownIt) {
  const original = md.renderer.rules.fence!
  md.renderer.rules.fence = (tokens, idx, options, ...resParams) => {
    const token = tokens[idx]
    if (token.info.startsWith('mermaid')) {
      const [caption, code] = splitMermaidCaption(token.content.trim())
      const safeCaption = (caption || token.info.slice('mermaid'.length + 1)).replace(/"/g, '&quot;')
      const safeCode = JSON.stringify(code).replace(/"/g, "&quot;")
      return `<ClientOnly><Mermaid :value="${safeCode}" caption="${safeCaption}" /></ClientOnly>`
    }

    return original(tokens, idx, options, ...resParams)
  }
}

function splitMermaidCaption(content: string): [string, string] {
  const captionLines: string[] = []
  const lines = content.split('\n')
  while (lines.length > 0 && lines[0].startsWith('#')) {
    captionLines.push(lines.shift()!.slice(1).trim())
  }

  return [captionLines.join(' '), lines.join('\n')]
}
