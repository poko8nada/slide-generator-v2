import DOMPurify from 'dompurify'
import { remark } from 'remark'
import gfm from 'remark-gfm'
import html from 'remark-html'

// mdをHTMLに変換する関数、サニタイズもされている
export default async function markdownToHtml(mdData: string) {
  const rawHtml = await remark()
    .use(html, { sanitize: false })
    .use(gfm)
    .process(mdData)
  return DOMPurify.sanitize(rawHtml.toString(), {
    ALLOWED_TAGS: [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'p',
      'img',
      'br',
      'ul',
      'ol',
      'li',
      'a',
      'code',
      'pre',
      'blockquote',
      'strong',
      'em',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'div',
      'span',
      'hr',
    ],
    ALLOWED_ATTR: [
      'src',
      'alt',
      'href',
      'class',
      'id',
      'title',
      'style',
      'width',
      'height',
      'align',
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|blob|data):|[/#])/i,
  })
}
