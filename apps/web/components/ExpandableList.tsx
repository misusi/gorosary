'use client';

import { useState } from 'react';

/**
 * A list of passages that open to show their text.
 *
 * The verses are found on the server and passed in: the Bible is a great deal
 * too large to carry in a browser's memory just so that a few passages can be
 * opened.
 */

export interface PassageVerse {
  verse: string;
  text: string;
}

export interface ExpandableItem {
  key: string;
  title: string;
  /** The reference, shown to the right of the title. */
  detail?: string;
  verses: PassageVerse[];
}

export function ExpandableList({ items }: { items: ExpandableItem[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="expandable">
      {items.map((item) => {
        const isOpen = open === item.key;

        return (
          <div className="expandable__item" key={item.key}>
            <button
              type="button"
              className="expandable__toggle"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : item.key)}
            >
              <span className="expandable__title">{item.title}</span>
              {item.detail ? (
                <span className="expandable__detail">{item.detail}</span>
              ) : null}
              <span className="expandable__arrow" aria-hidden="true">
                {isOpen ? '−' : '+'}
              </span>
            </button>

            {isOpen ? (
              <div className="expandable__verses">
                {item.verses.length > 0 ? (
                  item.verses.map((verse) => (
                    <p className="verse" key={verse.verse}>
                      <span className="verse__number">{verse.verse}</span>
                      {verse.text}
                    </p>
                  ))
                ) : (
                  <p className="expandable__empty">
                    The text of this passage is not in the app yet.
                  </p>
                )}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
