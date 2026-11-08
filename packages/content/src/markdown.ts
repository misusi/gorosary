import type { Block } from './schema.js';

/**
 * A deliberately tiny Markdown subset.
 *
 * We only need paragraph, quote, heading, and list rendering for prayer texts,
 * plus inline emphasis. A full Markdown engine would be a heavy dependency that
 * behaves differently in the browser and in React Native. This parser produces
 * the same AST everywhere, so a prayer reads identically on web and in the app.
 *
 * Supported:
 *   # Heading        (levels 1-4)
 *   > Rubric        (block quote)
 *   - item          (unordered list)
 *   1. item         (ordered list)
 *   **bold**  *italic*  __bold__  _italic_
 */

const HEADING = /^(#{1,4})\s+(.*)$/;
const QUOTE = /^>\s?(.*)$/;
const BULLET = /^[-*]\s+(.*)$/;
const ORDERED = /^\d+[.)]\s+(.*)$/;

export function parseBlocks(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];

  let paragraph: string[] = [];
  let quote: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({ type: 'paragraph', text: paragraph.join(' ').trim() });
      paragraph = [];
    }
  };
  const flushQuote = () => {
    if (quote.length > 0) {
      blocks.push({ type: 'quote', text: quote.join(' ').trim() });
      quote = [];
    }
  };
  const flushList = () => {
    if (list) {
      blocks.push({ type: 'list', ordered: list.ordered, items: list.items });
      list = null;
    }
  };
  const flushAll = () => {
    flushParagraph();
    flushQuote();
    flushList();
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === '') {
      flushAll();
      continue;
    }

    const heading = HEADING.exec(trimmed);
    if (heading) {
      flushAll();
      blocks.push({
        type: 'heading',
        level: (heading[1] ?? '#').length,
        text: (heading[2] ?? '').trim(),
      });
      continue;
    }

    const quoted = QUOTE.exec(trimmed);
    if (quoted) {
      flushParagraph();
      flushList();
      quote.push((quoted[1] ?? '').trim());
      continue;
    }

    const bullet = BULLET.exec(trimmed);
    if (bullet) {
      flushParagraph();
      flushQuote();
      if (!list || list.ordered) {
        flushList();
        list = { ordered: false, items: [] };
      }
      list.items.push((bullet[1] ?? '').trim());
      continue;
    }

    const ordered = ORDERED.exec(trimmed);
    if (ordered) {
      flushParagraph();
      flushQuote();
      if (!list || !list.ordered) {
        flushList();
        list = { ordered: true, items: [] };
      }
      list.items.push((ordered[1] ?? '').trim());
      continue;
    }

    // A wrapped line inside a list continues the item above it. Without this,
    // a bullet that runs onto a second line would fall out of the list and
    // become a stray paragraph in the middle of it.
    if (list) {
      const last = list.items[list.items.length - 1];
      if (last !== undefined) {
        list.items[list.items.length - 1] = `${last} ${trimmed}`;
        continue;
      }
    }

    flushQuote();
    flushList();
    paragraph.push(trimmed);
  }

  flushAll();
  return blocks;
}

export type InlineToken =
  | { kind: 'text'; text: string }
  | { kind: 'bold'; text: string }
  | { kind: 'italic'; text: string };

const INLINE = /(\*\*|__)(.+?)\1|(\*|_)(.+?)\3/g;

/**
 * Splits a line of text into inline emphasis tokens.
 *
 * The renderers (web and native) stay separate — they differ in primitives —
 * but they consume identical token streams, so emphasis can never drift
 * between the website and the app.
 */
export function parseInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let cursor = 0;

  INLINE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = INLINE.exec(text)) !== null) {
    if (match.index > cursor) {
      tokens.push({ kind: 'text', text: text.slice(cursor, match.index) });
    }
    const strong = match[1];
    const strongText = match[2];
    const em = match[3];
    const emText = match[4];
    if (strong !== undefined && strongText !== undefined) {
      tokens.push({ kind: 'bold', text: strongText });
    } else if (em !== undefined && emText !== undefined) {
      tokens.push({ kind: 'italic', text: emText });
    }
    cursor = match.index + match[0].length;
  }

  if (cursor < text.length) {
    tokens.push({ kind: 'text', text: text.slice(cursor) });
  }
  return tokens;
}

/** Strips every markdown marker — used for search indexes and previews. */
export function plainText(text: string): string {
  return parseInline(text)
    .map((token) => token.text)
    .join('');
}
