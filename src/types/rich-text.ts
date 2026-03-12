/**
 * Rich text mark metadata returned by the delivery API.
 */
export interface RichTextMark {
  type: string;
  attrs?: Record<string, unknown>;
}

/**
 * Common rich text node attributes returned by the delivery API.
 */
export interface RichTextNodeAttributes {
  level?: number;
  textAlign?: string | null;
  [key: string]: unknown;
}

/**
 * Generic rich text node returned by the delivery API.
 */
export interface RichTextNode {
  type: string;
  text?: string;
  marks?: RichTextMark[];
  attrs?: RichTextNodeAttributes;
  content?: RichTextNode[];
}

/**
 * Root rich text document returned by the delivery API.
 */
export interface RichTextDocument extends RichTextNode {
  type: 'doc';
  content?: RichTextNode[];
}
