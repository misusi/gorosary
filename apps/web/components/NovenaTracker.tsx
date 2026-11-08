'use client';

import { useEffect, useState } from 'react';
import { InlineText } from './Blocks';

const storageKey = (docId: string) => `gorosary:novena:${docId}`;

function readDone(docId: string): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(storageKey(docId));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((n): n is number => typeof n === 'number') : [];
  } catch {
    return [];
  }
}

export function NovenaTracker({
  docId,
  days,
}: {
  docId: string;
  days: { day: number; title?: string; text: string }[];
}) {
  const [done, setDone] = useState<number[]>([]);

  useEffect(() => {
    setDone(readDone(docId));
  }, [docId]);

  const toggle = (day: number) => {
    setDone((current) => {
      const next = current.includes(day)
        ? current.filter((value) => value !== day)
        : [...current, day].sort((a, b) => a - b);
      try {
        window.localStorage.setItem(storageKey(docId), JSON.stringify(next));
      } catch {
        /* storage unavailable — the tracker simply will not persist */
      }
      return next;
    });
  };

  return (
    <div>
      <p className="small muted" style={{ margin: '0 0 14px' }}>
        {done.length} of {days.length} days prayed. Your progress is saved on this
        device only.
      </p>

      {days.map((day) => {
        const isDone = done.includes(day.day);
        return (
          <div
            className={`novena-day${isDone ? ' novena-day--done' : ''}`}
            key={day.day}
          >
            <button
              type="button"
              className="novena-day__check"
              aria-pressed={isDone}
              aria-label={`Mark day ${day.day} as prayed`}
              onClick={() => toggle(day.day)}
            >
              ✓
            </button>
            <div>
              <p className="novena-day__num">Day {day.day}</p>
              {day.title ? <h3 className="novena-day__title">{day.title}</h3> : null}
              <p className="novena-day__text">
                <InlineText text={day.text} />
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
