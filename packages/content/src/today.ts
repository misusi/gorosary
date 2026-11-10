import type { Mystery, MysterySetId } from './schema.js';
import { moveableFeastsFor, type Commemoration } from './calendar/feasts.js';
import { describeDay, type DayDescription } from './calendar/day.js';
import { toIsoDate, localToday, daysBetween, utcDate } from './calendar/dates.js';
import { liturgicalYear } from './calendar/liturgical.js';
import { findNavDoc } from './nav.js';
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

export interface CurrentNovena {
  id: string;
  title: string;
  href: string;
  /** Which day of the novena it is, counting the first as the first. */
  day: number;
  /** How many days the novena runs for. */
  duration: number;
  patron: string;
  occasion?: string;
}

/**
 * The novenas that are being made today.
 *
 * A novena is begun on a fixed day of the year — St. Joseph's on the
 * fifteenth of March, St. Jude's on the twenty-eighth of October — or, for
 * the two that follow the Easter cycle, on the solemnity itself. It is then
 * said for nine days.
 */
export function currentNovenas(date: Date): CurrentNovena[] {
  const running: CurrentNovena[] = [];

  for (const doc of content) {
    if (doc.kind !== 'novena') continue;

    const start = novenaStart(doc.novena.begins, date, doc.novena.duration);
    if (!start) continue;

    const elapsed = daysBetween(start, date);
    if (elapsed < 0 || elapsed >= doc.novena.duration) continue;

    running.push({
      id: doc.id,
      title: doc.title,
      href: findNavDoc(doc.id)?.href ?? '/novenas',
      day: elapsed + 1,
      duration: doc.novena.duration,
      patron: doc.novena.patron,
      ...(doc.novena.occasion ? { occasion: doc.novena.occasion } : {}),
    });
  }

  return running.sort((a, b) => a.title.localeCompare(b.title));
}

/**
 * The day a novena is begun, or null when it is not begun on a fixed day.
 *
 * A novena begun late in December runs into January, so the start of the
 * previous year is tried as well.
 */
function novenaStart(
  begins: string | undefined,
  date: Date,
  duration: number,
): Date | null {
  if (!begins) return null;

  const year = date.getUTCFullYear();

  if (begins === 'pentecost') {
    return liturgicalYear(year).pentecost;
  }

  if (begins === 'sacred-heart') {
    return liturgicalYear(year).sacredHeart;
  }

  const [month, day] = begins.split('-').map(Number);
  const thisYear = utcDate(year, month ?? 1, day ?? 1);
  const lastYear = utcDate(year - 1, month ?? 1, day ?? 1);

  // A novena begun late in December runs into January, so the start of the
  // previous year is tried as well.
  const elapsed = daysBetween(lastYear, date);
  return elapsed >= 0 && elapsed < duration ? lastYear : thisYear;
}

export function getTodayRosary(
  instant: Date = new Date(),
  timeZone?: string,
): TodayRosary {
  // `instant` is a point in time; the day we reason about is the user's day.
  const date = localToday(instant, timeZone);
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

