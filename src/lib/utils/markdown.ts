import { Marked } from 'marked';
import hljs from 'highlight.js';
import DOMPurify from 'dompurify';

const marked = new Marked({
  breaks: true,
  gfm: true,
});

marked.use({
  renderer: {
    code({ text, lang }: { text: string; lang?: string }): string {
      const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
      const highlighted = hljs.highlight(text, { language }).value;
      return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
    },
  },
});

export function renderMarkdown(content: string): string {
  const raw = marked.parse(content);
  const html = typeof raw === 'string' ? raw : '';
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ['pre', 'code'],
    ADD_ATTR: ['class'],
  });
}
