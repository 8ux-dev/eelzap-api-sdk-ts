import { describe, expect, it } from 'vitest';

import { getMediaUrl, richTextToHtml, richTextToPlainText } from './rich-text';
import type { RichTextDocument } from './types';

const sampleDocument: RichTextDocument = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Product title' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Bold', marks: [{ type: 'bold' }] },
        { type: 'text', text: ' and ' },
        { type: 'text', text: 'italic', marks: [{ type: 'italic' }] },
      ],
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'First item' }],
            },
          ],
        },
      ],
    },
    {
      type: 'paragraph',
      attrs: { textAlign: 'center' },
      content: [{ type: 'text', text: 'Centered text' }],
    },
  ],
};

describe('rich text helpers', () => {
  it('converts rich text to plain text', () => {
    expect(richTextToPlainText(sampleDocument)).toBe(
      'Product title Bold and italic First item Centered text',
    );
    expect(richTextToPlainText(null)).toBe('');
  });

  it('converts rich text to html', () => {
    expect(richTextToHtml(sampleDocument)).toBe(
      '<h2>Product title</h2><p><strong>Bold</strong> and <em>italic</em></p><ul><li><p>First item</p></li></ul><p style="text-align:center">Centered text</p>',
    );
    expect(richTextToHtml(null)).toBe('');
  });

  it('supports additional marks and node types', () => {
    const advancedDocument: RichTextDocument = {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 8 },
          content: [{ type: 'text', text: 'Escaped <title>' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Under', marks: [{ type: 'underline' }] },
            { type: 'text', text: ' ' },
            { type: 'text', text: 'Strike', marks: [{ type: 'strike' }] },
            { type: 'text', text: ' ' },
            { type: 'text', text: 'Code', marks: [{ type: 'code' }] },
            {
              type: 'text',
              text: ' Link',
              marks: [{ type: 'link', attrs: { href: 'https://example.com?q=1&v=2' } }],
            },
            {
              type: 'text',
              text: ' NoHref',
              marks: [{ type: 'link', attrs: {} }],
            },
          ],
        },
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ordered' }] }],
            },
          ],
        },
        { type: 'horizontalRule' },
        { type: 'hardBreak' },
        { type: 'paragraph', content: [] },
        {
          type: 'unknown',
          content: [{ type: 'text', text: 'Fallback node' }],
        },
        {
          type: 'heading',
          attrs: { level: 'oops' as unknown as number },
          content: [{ type: 'text', text: 'Fallback heading' }],
        },
        {
          type: 'unknown',
        },
      ],
    };

    expect(richTextToHtml(advancedDocument)).toBe(
      '<h6>Escaped &lt;title&gt;</h6><p><u>Under</u> <s>Strike</s> <code>Code</code><a href="https://example.com?q=1&amp;v=2"> Link</a> NoHref</p><ol><li><p>Ordered</p></li></ol><hr /><br /><p>&nbsp;</p>Fallback node<h2>Fallback heading</h2>',
    );
  });

  it('resolves public and signed media urls', () => {
    expect(getMediaUrl({ url: 'https://cdn.example.com/image.jpg', signedUrl: null })).toBe(
      'https://cdn.example.com/image.jpg',
    );
    expect(getMediaUrl({ url: null, signedUrl: 'https://signed.example.com/file.pdf' })).toBe(
      'https://signed.example.com/file.pdf',
    );
    expect(getMediaUrl(null)).toBeNull();
  });
});
