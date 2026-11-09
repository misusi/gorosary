import type { Mystery, MysterySetId } from './schema.js';
import { moveableFeastsFor, type Commemoration } from './calendar/feasts.js';
import { describeDay, type DayDescription } from './calendar/day.js';
import { toIsoDate, localToday } from './calendar/dates.js';
import {
  MYSTERY_SET_TITLES,
  resolveMysteries,
  type MysteryAlternative,
  type MysterySource,
} from './calendar/rules.js';
import { content } from './generated/content.js';

/**
 * "Today" — the landing page of the whole site.
 *
 * The mystery set is decided by the calendar rules, then the commemorations
 * of the day are collected from both the moveable feasts (computed) and the
 * fixed-date saints (content data).
 */

export interface TodayRosary {
  date: Date;
  iso: string;
  weekday: string;
  season: string;
  seasonLabel: string;
  set: MysterySetId;
  setTitle: string;
  reason: string;
  /** Whether the answer came from a feast, the season, or the day of the week. */
  source: MysterySource;
  alternative: MysteryAlternative;
  mysteries: Mystery[];
  commemorations: Commemoration[];
  /** Everything the Church's calendar says about today. */
  day: DayDescription;
}

export function mysterySetTitle(id: MysterySetId): string {
  return MYSTERY_SET_TITLES[id];
}

/** Finds the mystery set across every rosary document in the content set. */
export function findMysterySet(
  id: MysterySetId,
): { docId: string; set: MysterySetId } | null {
  for (const doc of content) {
    if (doc.kind !== 'rosary') continue;
    const found = doc.sets.find((set) => set.id === id);
    if (found) {
      return { docId: doc.id, set: found.id };
    }
  }
  return null;
}

export function mysteriesFor(id: MysterySetId): Mystery[] {
  for (const doc of content) {
    if (doc.kind !== 'rosary') continue;
    const found = doc.sets.find((set) => set.id === id);
    if (found) return found.mysteries;
  }
  return [];
}

/** Fixed-date commemorations for a date, taken from the saints calendar. */
export function fixedFeastsFor(date: Date): Commemoration[] {
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const results: Commemoration[] = [];

  for (const doc of content) {
    if (doc.kind !== 'calendar') continue;
    for (const entry of doc.entries) {
      if (entry.month === month && entry.day === day) {
        results.push({
          name: entry.name,
          kind: entry.kind ?? 'commemoration',
          ...(entry.note ? { note: entry.note } : {}),
        });
      }
    }
  }
  return results;
}

export function commemorationsFor(date: Date): Commemoration[] {
  return [...moveableFeastsFor(date), ...fixedFeastsFor(date)];
}

export function getTodayRosary(instant: Date = new Date()): TodayRosary {
  // `instant` is a point in time; the day we reason about is the user's day.
  const date = localToday(instant);
  const resolution = resolveMysteries(date);
  const commemorations = commemorationsFor(date);
  return {
    date: resolution.date,
    iso: toIsoDate(date),
    weekday: resolution.weekday,
    season: resolution.season,
    seasonLabel: resolution.seasonLabel,
    set: resolution.set,
    setTitle: resolution.title,
    reason: resolution.reason,
    source: resolution.source,
    alternative: resolution.alternative,
    mysteries: mysteriesFor(resolution.set),
    commemorations,
    // `describeDay` reads the day in UTC, so it has to be given the user's
    // day and not the instant. Given the instant, the calendar panel would
    // describe tomorrow from the evening onwards. The commemorations go
    // with it, because a saint's feast brings its own liturgical colour.
    day: describeDay(date, commemorations),
  };
}
