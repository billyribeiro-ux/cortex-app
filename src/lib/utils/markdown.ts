import { Marked } from 'marked';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import sql from 'highlight.js/lib/languages/sql';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';
import markdown from 'highlight.js/lib/languages/markdown';
import plaintext from 'highlight.js/lib/languages/plaintext';
import shell from 'highlight.js/lib/languages/shell';
import DOMPurify from 'dompurify';

const languages: [string, Parameters<typeof hljs.registerLanguage>[1]][] = [
  ['javascript', javascript],
  ['typescript', typescript],
  ['python', python],
  ['json', json],
  ['bash', bash],
  ['css', css],
  ['sql', sql],
  ['xml', xml],
  ['yaml', yaml],
  ['markdown', markdown],
  ['plaintext', plaintext],
  ['shell', shell],
];
languages.forEach(([name, lang]) => hljs.registerLanguage(name, lang));

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
