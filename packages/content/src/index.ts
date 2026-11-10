import type { Doc, DocKind, SectionId, MysterySetId } from './schema.js';
import { content } from './generated/content.js';
import { plainText } from './markdown.js';

/**
 * The runtime API of `@gorosary/content`.
 *
 * Everything the website and the app need to render prayer content. Nothing
 * here touches the filesystem or Node APIs — the content is compiled ahead of
 * time by `scripts/build-content.ts`, so the same bundle runs in the browser,
 * in React Native, and on a server.
 */

export { content };
export { parseBlocks, parseInline, plainText } from './markdown.js';
export { NAV, findNavDoc, navForSection } from './nav.js';
export type { NavDoc, NavSection } from './nav.js';
export {
  getTodayRosary,
  mysteriesFor,
  findMysterySet,
  mysterySetTitle,
  commemorationsFor,
  fixedFeastsFor,
} from './today.js';
export type { TodayRosary } from './today.js';
export { readingText, parseCitation } from './bible.js';
export type { Passage } from './bible.js';
export { currentNovenas } from './today.js';
export type { CurrentNovena } from './today.js';
export {
  resolveMysteries,
  FIXED_DATE_OVERRIDES,
  MOVABLE_OVERRIDES,
  PRIMARY_RULE,
  MYSTERY_SET_TITLES,
  WEEKLY_TRADITION,
  SEASON_TRADITION,
} from './calendar/rules.js';
export type {
  MysteryResolution,
  MysteryAlternative,
  MysterySource,
  PrimaryRule,
} from './calendar/rules.js';
export {
  liturgicalYear,
  seasonFor,
  easterDate,
  adventStart,
  baptismOfTheLord,
  SEASON_LABELS,
} from './calendar/liturgical.js';
export type { LiturgicalYear, Season } from './calendar/liturgical.js';
export { MOVEABLE_FEASTS, moveableFeastsFor } from './calendar/feasts.js';
export type { Commemoration, CommemorationKind } from './calendar/feasts.js';
export { describeDay } from './calendar/day.js';
export {
  APOSTLES_CREED,
  FINAL_PRAYER,
  GLORY_BE,
  HAIL_HOLY_QUEEN,
  HAIL_MARY,
  OH_MY_JESUS,
  OUR_FATHER,
  SIGN_OF_CROSS,
  THREE_HAIL_MARY_INTENTIONS,
  buildChapletSteps,
  buildNovenaSteps,
  buildRosarySteps,
} from './rosary-steps.js';
export type { RunnerStep } from './rosary-steps.js';
export type {
  DayColour,
  DayDescription,
  Fast,
  LiturgicalColour,
} from './calendar/day.js';
export {
  lectionaryPosition,
  cycleYearFor,
  liturgicalStartYear,
  holyFamilyDate,
  cycleSundaySlots,
  FIXED_SLOTS,
  CYCLE_START_YEARS,
} from './calendar/lectionary.js';
export type { CycleYear, LectionaryPosition } from './calendar/lectionary.js';
export {
  getReadings,
  availableReadingYears,
  yearEntries,
  CYCLE_TITLES,
  CYCLE_GOSPELS,
} from './readings.js';
export type { ReadingSet } from './readings.js';
export { WEEKDAY_NAMES, toIsoDate, monthDayKey, localToday } from './calendar/dates.js';
export type { WeekdayName } from './calendar/dates.js';

export type { Doc, DocKind, SectionId, MysterySetId };
export type {
  Block,
  Mystery,
  MysterySet,
  Novena,
  Station,
  Chapter,
  CalendarEntry,
  Reading,
  LectionaryEntry,
} from './schema.js';

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

const byId = new Map<string, Doc>(content.map((doc) => [doc.id, doc]));

export function getDoc(id: string): Doc | undefined {
  return byId.get(id);
}

export function getDocOrThrow(id: string): Doc {
  const doc = byId.get(id);
  if (!doc) throw new Error(`Unknown content id: ${id}`);
  return doc;
}

export function docsBySection(section: SectionId): Doc[] {
  return content.filter((doc) => doc.section === section);
}

export function docsByKind(kind: DocKind): Doc[] {
  return content.filter((doc) => doc.kind === kind);
}

export function allDocs(): Doc[] {
  return content;
}

/** Flattens a document into plain text for searching and previews. */
export function docText(doc: Doc): string {
  const parts: string[] = [doc.title, doc.subtitle ?? '', doc.summary ?? ''];
  for (const block of doc.body) {
    if (block.type === 'list') parts.push(...block.items);
    else parts.push(block.text);
  }
  return parts.filter(Boolean).join(' ');
}

/**
 * A deliberately simple search. Titles and summaries rank above body text.
 * Good enough for a site with well under a hundred documents; swap it for a
 * real index if the content grows past that.
 */
export function searchDocs(query: string, limit = 20): Doc[] {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) return [];

  const scored: { doc: Doc; score: number }[] = [];
  for (const doc of content) {
    const title = doc.title.toLowerCase();
    const subtitle = (doc.subtitle ?? '').toLowerCase();
    const summary = (doc.summary ?? '').toLowerCase();
    const body = docText(doc).toLowerCase();

    let score = 0;
    if (title === needle) score += 100;
    if (title.startsWith(needle)) score += 60;
    if (title.includes(needle)) score += 40;
    if (subtitle.includes(needle)) score += 20;
    if (summary.includes(needle)) score += 15;
    if (body.includes(needle)) score += 5;

    if (score > 0) scored.push({ doc, score });
  }

  return scored
    .sort((a, b) => b.score - a.score || a.doc.title.localeCompare(b.doc.title))
    .slice(0, limit)
    .map((entry) => entry.doc);
}
