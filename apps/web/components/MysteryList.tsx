'use client';

import { useState } from 'react';

/**
 * The five mysteries of the day, each of which opens to show its Scripture.
 *
 * The verses are found on the server and passed in: the Bible is a great deal
 * too large to carry in a browser's memory just so that five passages can be
 * opened.
 */

export interface MysteryVerse {
  verse: string;
  text: string;
}

export interface MysteryEntry {
  n: number;
  title: string;
  scripture: string;
  verses: MysteryVerse[];
}

export function MysteryList({ mysteries }: { mysteries: MysteryEntry[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="today__hub__mysteries">
      {mysteries.map((mystery) => {
        const isOpen = open === mystery.n;

        return (
          <div className="mystery-line" key={mystery.n}>
            <button
              type="button"
              className="mystery-line__toggle"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : mystery.n)}
            >
              <span className="mystery-line__title">
                {mystery.n}. {mystery.title}
              </span>
              <span className="mystery-line__scripture">
                {mystery.scripture}
              </span>
              <span className="mystery-line__arrow" aria-hidden="true">
                {isOpen ? '−' : '+'}
              </span>
            </button>

            {isOpen ? (
              <div className="mystery-line__verses">
                {mystery.verses.length > 0 ? (
                  mystery.verses.map((verse) => (
                    <p className="verse" key={verse.verse}>
                      <span className="verse__number">{verse.verse}</span>
                      {verse.text}
                    </p>
                  ))
                ) : (
                  <p className="mystery-line__verses-empty">
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
