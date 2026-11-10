'use client';

import { useEffect, useRef } from 'react';

/**
 * The search field.
 *
 * It is focused as soon as the page opens, because someone who has gone to
 * the search page means to type.
 */
export function SearchField({ value }: { value: string }) {
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    input.current?.focus();
  }, []);

  return (
    <div style={{ display: 'flex', gap: 10, maxWidth: 560 }}>
      <input
        ref={input}
        id="q"
        name="q"
        type="search"
        defaultValue={value}
        placeholder="St. Jude, sorrowful, Angelus, litany…"
        style={{
          flex: 1,
          padding: '12px 14px',
          fontSize: 16,
          borderRadius: 8,
          border: '1px solid var(--line)',
          background: 'var(--surface)',
          color: 'var(--ink)',
        }}
      />
      <button type="submit" className="button button--primary">
        Search
      </button>
    </div>
  );
}
