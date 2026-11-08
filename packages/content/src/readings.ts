import type { CycleYear, LectionaryPosition } from './calendar/lectionary.js';
import {
  CYCLE_START_YEARS,
  lectionaryPosition,
} from './calendar/lectionary.js';
import { addDays, localToday } from './calendar/dates.js';
import { liturgicalYear } from './calendar/liturgical.js';
import type { LectionaryEntry } from './schema.js';
import { content } from './generated/content.js';

/**
 * The readings for a day.
 *
 * The content holds one document per cycle year, plus one for the readings
 * that never change. `getReadings` finds the entry for today's slot; when the
 * day has no entry of its own — a weekday in the middle of Ordinary Time —
 * it falls back to the Sunday of that week, which is the week the readings
 * are really about.
 */

export interface ReadingSet {
  position: LectionaryPosition;
  /** The entry for this day, if the content has one. */
  entry: LectionaryEntry | null;
  /** The Sunday of this week, used when the day has no entry of its own. */
  weekEntry: LectionaryEntry | null;
  /** True when `entry` is this day's own rather than the week's. */
  isOwnDay: boolean;
  /** True when the day's readings are in the content at all. */
  hasReadings: boolean;
}

function entriesForCycle(cycle: CycleYear | 'common'): LectionaryEntry[] {
  const entries: LectionaryEntry[] = [];
  for (const doc of content) {
    if (doc.kind !== 'readings') continue;
    if (doc.cycle !== cycle) continue;
    entries.push(...doc.entries);
  }
  return entries;
}

/**
 * Finds the entry for a slot.
 *
 * The cycle document is checked first: a few days keep the same Gospel every
 * year but change their First Reading with the cycle, so the cycle-specific
 * entry wins over the fixed one.
 */
function findEntry(
  cycle: CycleYear | 'common',
  slot: string,
): LectionaryEntry | null {
  const cycles: (CycleYear | 'common')[] = [cycle, 'common'];
  for (const wanted of cycles) {
    for (const doc of content) {
      if (doc.kind !== 'readings') continue;
      if (doc.cycle !== wanted) continue;
      const found = doc.entries.find((entry) => entry.slot === slot);
      if (found) return found;
    }
  }
  return null;
}

/** The Sunday of the week a slot belongs to, if it has one. */
function sundaySlotFor(position: LectionaryPosition): string | null {
  if (position.slot.startsWith('named:')) return null;
  if (position.weekday === 0) return position.slot;
  const parts = position.slot.split(':');
  if (parts.length !== 3) return null;
  return `${parts[0]}:${parts[1]}:0`;
}

export function getReadings(instant: Date = new Date()): ReadingSet {
  const date = localToday(instant);
  const position = lectionaryPosition(date);

  const own = findEntry(position.cycle, position.slot);
  if (own) {
    return {
      position,
      entry: own,
      weekEntry: own,
      isOwnDay: true,
      hasReadings: true,
    };
  }

  const sundaySlot = sundaySlotFor(position);
  const weekEntry = sundaySlot ? findEntry(position.cycle, sundaySlot) : null;

  return {
    position,
    entry: weekEntry,
    weekEntry,
    isOwnDay: false,
    hasReadings: weekEntry !== null,
  };
}

/**
 * Every reading day of a cycle year, in the order they fall.
 *
 * Walks the liturgical year from Advent to the end of Ordinary Time, taking
 * every Sunday and every solemnity that carries readings of its own. The
 * fixed readings come from the common document, the rest from the cycle
 * document.
 */
export function yearEntries(cycle: CycleYear): LectionaryEntry[] {
  const startYear = CYCLE_START_YEARS[cycle];
  const year = liturgicalYear(startYear);
  const end = addDays(year.adventStart, 365);

  const seen = new Set<string>();
  const entries: LectionaryEntry[] = [];

  for (
    let day = new Date(year.adventStart.getTime());
    day < end;
    day = addDays(day, 1)
  ) {
    const position = lectionaryPosition(day);
    const isNamed = position.slot.startsWith('named:');
    if (!position.isSunday && !isNamed) continue;
    if (seen.has(position.slot)) continue;
    seen.add(position.slot);

    const entry = findEntry(cycle, position.slot);
    if (entry) entries.push(entry);
  }

  return entries;
}

/** Every Sunday of a cycle year, for browsing the year. */
export function sundayEntriesForCycle(cycle: CycleYear): LectionaryEntry[] {
  return entriesForCycle(cycle)
    .filter((entry) => entry.slot.endsWith(':0') || entry.slot.startsWith('named:'))
    .sort((a, b) => a.slot.localeCompare(b.slot));
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
