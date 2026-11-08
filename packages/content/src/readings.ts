import type { CycleYear, LectionaryPosition } from './calendar/lectionary.js';
import { lectionaryPosition } from './calendar/lectionary.js';
import { localToday } from './calendar/dates.js';
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
