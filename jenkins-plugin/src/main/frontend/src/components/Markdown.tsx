import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { useEffect, useMemo, useRef } from 'react';
import { hljs } from '../highlight';

marked.setOptions({ gfm: true, breaks: true });

export function Markdown({ text }: { text: string }): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const html = useMemo(() => {
    const parsed = marked.parse(text, { async: false });
    return DOMPurify.sanitize(parsed as string, {
      ADD_ATTR: ['target', 'rel'],
    });
  }, [text]);

  useEffect(() => {
    const root = ref.current;
    if (!root) {
      return;
    }
    root.querySelectorAll('pre > code').forEach((node) => {
      const code = node as HTMLElement;
      const pre = code.parentElement;
      if (!pre || pre.parentElement?.classList.contains('cp-code')) {
        return;
      }
      const language =
        Array.from(code.classList)
          .find((name) => name.startsWith('language-'))
          ?.slice('language-'.length) ?? 'text';
      try {
        hljs.highlightElement(code);
      } catch {
        // Unknown language; show unhighlighted code.
      }
      const wrapper = document.createElement('div');
      wrapper.className = 'cp-code';
      const head = document.createElement('div');
      head.className = 'cp-code-head';
      const label = document.createElement('span');
      label.textContent = language;
      const spacer = document.createElement('span');
      spacer.className = 'cp-grow';
      const copy = document.createElement('button');
      copy.type = 'button';
      copy.className = 'cp-copy';
      copy.textContent = 'copy';
      copy.addEventListener('click', () => {
        void navigator.clipboard?.writeText(code.textContent ?? '');
        copy.textContent = 'copied';
        window.setTimeout(() => {
          copy.textContent = 'copy';
        }, 1200);
      });
      head.append(label, spacer, copy);
      pre.replaceWith(wrapper);
      wrapper.append(head, pre);
    });
    root.querySelectorAll('a').forEach((link) => {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noreferrer noopener');
    });
  }, [html]);

  return <div className="cp-msg-body" ref={ref} dangerouslySetInnerHTML={{ __html: html }} />;
}
