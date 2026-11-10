import type { CycleYear, LectionaryPosition } from './calendar/lectionary.js';
import {
  CYCLE_START_YEARS,
  lectionaryPosition,
} from './calendar/lectionary.js';
import { localToday, toIsoDate } from './calendar/dates.js';
import { liturgicalYear } from './calendar/liturgical.js';
import type { Doc, LectionaryEntry } from './schema.js';
import { content } from './generated/content.js';

/**
 * The readings of a day.
 *
 * The content holds one document per calendar year, holding the readings of
 * every day of that year as the United States Conference of Catholic Bishops
 * sets them. The lookup is by date, because that is how the lectionary works:
 * the same Sunday falls on a different date each year, and the weekday
 * readings move with it.
 */

export interface ReadingSet {
  position: LectionaryPosition;
  /** The readings for this day, if the year is in the app. */
  entry: LectionaryEntry | null;
  hasReadings: boolean;
  /** The calendar year the readings come from. */
  year: number;
  /** The years the app has readings for. */
  availableYears: number[];
}

function readingsDocFor(year: number) {
  return content.find(
    (doc): doc is Extract<Doc, { kind: 'readings' }> =>
      doc.kind === 'readings' && doc.year === year,
  );
}

export function getReadings(
  instant: Date = new Date(),
  timeZone?: string,
): ReadingSet {
  const date = localToday(instant, timeZone);
  const position = lectionaryPosition(date);
  const year = date.getUTCFullYear();
  const doc = readingsDocFor(year);
  const entry = doc?.entries.find((item) => item.date === toIsoDate(date)) ?? null;

  return {
    position,
    entry,
    hasReadings: entry !== null,
    year,
    availableYears: availableReadingYears(),
  };
}

/** The calendar years the app has readings for. */
export function availableReadingYears(): number[] {
  const years: number[] = [];
  for (const doc of content) {
    if (doc.kind === 'readings') years.push(doc.year);
  }
  return years.sort((a, b) => a - b);
}

/** Every day of a calendar year, in order. */
export function yearEntries(year: number): LectionaryEntry[] {
  const doc = readingsDocFor(year);
  if (!doc) return [];
  return [...doc.entries].sort((a, b) => a.date.localeCompare(b.date));
}

export const CYCLE_TITLES: Record<CycleYear, string> = {
  a: 'Year A',
  b: 'Year B',
  c: 'Year C',
};

export const CYCLE_GOSPELS: Record<CycleYear, string> = {
  a: 'the Gospel of Matthew',
  b: 'the Gospel of Mark',
  c: 'the Gospel of Luke',
};

export { CYCLE_START_YEARS, liturgicalYear };

