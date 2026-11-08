import { parseInline, type Block } from '@gorosary/content';

/** Renders inline emphasis (`**bold**`, `*italic*`) as React nodes. */
export function InlineText({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((token, index) => {
        const key = `${token.kind}-${index}`;
        if (token.kind === 'bold') return <strong key={key}>{token.text}</strong>;
        if (token.kind === 'italic') return <em key={key}>{token.text}</em>;
        return <span key={key}>{token.text}</span>;
      })}
    </>
  );
}

export function Blocks({
  blocks,
  className,
}: {
  blocks: Block[];
  className?: string;
}) {
  return (
    <div className={className ?? 'prose'}>
      {blocks.map((block, index) => (
        <BlockView key={index} block={block} />
      ))}
    </div>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p>
          <InlineText text={block.text} />
        </p>
      );
    case 'quote':
      return (
        <blockquote>
          <InlineText text={block.text} />
        </blockquote>
      );
    case 'heading': {
      const Tag = `h${Math.min(block.level + 1, 4)}` as 'h2' | 'h3' | 'h4';
      return (
        <Tag id={slugify(block.text)}>
          <InlineText text={block.text} />
        </Tag>
      );
    }
    case 'list':
      return block.ordered ? (
        <ol>
          {block.items.map((item, index) => (
            <li key={index}>
              <InlineText text={item} />
            </li>
          ))}
        </ol>
      ) : (
        <ul>
          {block.items.map((item, index) => (
            <li key={index}>
              <InlineText text={item} />
            </li>
          ))}
        </ul>
      );
    default:
      return null;
  }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}
