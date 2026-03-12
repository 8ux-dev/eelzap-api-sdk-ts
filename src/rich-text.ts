import type { RichTextDocument, RichTextNode } from './types/rich-text';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderTextNode(node: RichTextNode): string {
  let content = escapeHtml(node.text ?? '');

  for (const mark of node.marks ?? []) {
    if (mark.type === 'bold') {
      content = `<strong>${content}</strong>`;
      continue;
    }

    if (mark.type === 'italic') {
      content = `<em>${content}</em>`;
      continue;
    }

    if (mark.type === 'underline') {
      content = `<u>${content}</u>`;
      continue;
    }

    if (mark.type === 'strike') {
      content = `<s>${content}</s>`;
      continue;
    }

    if (mark.type === 'code') {
      content = `<code>${content}</code>`;
      continue;
    }

    if (mark.type === 'link') {
      const href = typeof mark.attrs?.href === 'string' ? escapeHtml(mark.attrs.href) : undefined;
      content = href ? `<a href="${href}">${content}</a>` : content;
    }
  }

  return content;
}

function renderNodeChildren(node: RichTextNode): string {
  return (node.content ?? []).map((child) => renderRichTextNode(child)).join('');
}

function renderNodeStyle(node: RichTextNode): string {
  const textAlign = node.attrs?.textAlign;

  if (typeof textAlign !== 'string' || textAlign.length === 0) {
    return '';
  }

  return ` style="text-align:${escapeHtml(textAlign)}"`;
}

function renderRichTextNode(node: RichTextNode): string {
  if (node.type === 'text') {
    return renderTextNode(node);
  }

  const children = renderNodeChildren(node);
  const style = renderNodeStyle(node);

  switch (node.type) {
    case 'doc':
      return children;
    case 'paragraph':
      return `<p${style}>${children || '&nbsp;'}</p>`;
    case 'heading': {
      const levelValue = node.attrs?.level;
      const level = typeof levelValue === 'number' ? Math.min(Math.max(levelValue, 1), 6) : 2;
      const tagName = `h${String(level)}`;
      return `<${tagName}${style}>${children}</${tagName}>`;
    }
    case 'bulletList':
      return `<ul>${children}</ul>`;
    case 'orderedList':
      return `<ol>${children}</ol>`;
    case 'listItem':
      return `<li>${children}</li>`;
    case 'horizontalRule':
      return '<hr />';
    case 'hardBreak':
      return '<br />';
    default:
      return children;
  }
}

/**
 * Resolves the best usable URL for a media value.
 */
export function getMediaUrl(
  media:
    | {
        url: string | null;
        signedUrl: string | null;
      }
    | null
    | undefined,
): string | null {
  if (!media) {
    return null;
  }

  return media.url ?? media.signedUrl ?? null;
}

/**
 * Converts a rich text document into plain text.
 */
export function richTextToPlainText(
  value: RichTextDocument | RichTextNode | null | undefined,
): string {
  if (!value) {
    return '';
  }

  const ownText = typeof value.text === 'string' ? value.text : '';
  const childText = (value.content ?? []).map((child) => richTextToPlainText(child)).join(' ');

  return `${ownText} ${childText}`.replace(/\s+/g, ' ').trim();
}

/**
 * Converts a rich text document into semantic HTML.
 */
export function richTextToHtml(value: RichTextDocument | RichTextNode | null | undefined): string {
  if (!value) {
    return '';
  }

  return renderRichTextNode(value);
}
