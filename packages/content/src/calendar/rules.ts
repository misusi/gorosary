import type { MysterySetId } from '../schema.js';
import { WEEKDAY_NAMES, isSameDay, monthDayKey } from './dates.js';
import {
  type LiturgicalYear,
  type Season,
  SEASON_LABELS,
  liturgicalYear,
  seasonFor,
} from './liturgical.js';

/**
 * Which mysteries are prayed today.
 *
 * Three rules can be selected with PRIMARY_RULE below. Everything else is
 * data, so changing the answer to this question is a one-line edit.
 *
 *   'hybrid'     (default) The Church's seasons decide where they have real
 *                 force — Advent, Christmas, Lent, Holy Week, Easter — and the
 *                 day of the week decides in Ordinary Time, which is six
 *                 months of nothing special and needs variety.
 *
 *   'liturgical' The season of the Church's calendar decides every day of the
 *                 year: Joyful in Advent, Christmas and Ordinary Time,
 *                 Sorrowful in Lent and Holy Week, Glorious at Easter.
 *
 *   'weekly'     The classic day-of-week assignment decides every day:
 *                 Mon/Sat Joyful, Tue/Fri Sorrowful, Wed/Sun Glorious,
 *                 Thu Luminous.
 *
 * Feasts always override all three. Our Lady of Sorrows on 15 September is
 * the Sorrowful Mysteries whatever the rule says, because the day is given
 * to Mary's grief.
 *
 * Whichever rule is in force, the other answer is always shown alongside it.
 * A person praying at home expects to see the day-of-week answer, and the
 * app should not pick a fight with them.
 */

export type PrimaryRule = 'hybrid' | 'liturgical' | 'weekly';

export const PRIMARY_RULE: PrimaryRule = 'hybrid';

/** Where the primary answer came from, so the app can explain itself. */
export type MysterySource = 'feast' | 'season' | 'week';

export interface MysteryAlternative {
  set: MysterySetId;
  title: string;
  reason: string;
  tradition: string;
}

export interface MysteryResolution {
  date: Date;
  weekday: string;
  season: Season;
  seasonLabel: string;
  set: MysterySetId;
  title: string;
  /** A full sentence explaining why this set is prayed today. */
  reason: string;
  source: MysterySource;
  /** The other tradition's answer, shown alongside but never replacing the primary. */
  alternative: MysteryAlternative;
}

export const MYSTERY_SET_TITLES: Record<MysterySetId, string> = {
  joyful: 'Joyful Mysteries',
  sorrowful: 'Sorrowful Mysteries',
  glorious: 'Glorious Mysteries',
  luminous: 'Luminous Mysteries',
};

export const WEEKLY_TRADITION = 'the older weekly cycle';
export const SEASON_TRADITION = "the Church's calendar";

const SEASON_SETS: Record<Season, { set: MysterySetId }> = {
  advent: { set: 'joyful' },
  christmas: { set: 'joyful' },
  lent: { set: 'sorrowful' },
  'holy-week': { set: 'sorrowful' },
  easter: { set: 'glorious' },
  ordinary: { set: 'joyful' },
};

const WEEKLY_SETS: { weekday: number; set: MysterySetId; reason: string }[] = [
  { weekday: 1, set: 'joyful', reason: 'Mondays traditionally use the Joyful Mysteries.' },
  { weekday: 2, set: 'sorrowful', reason: 'Tuesdays traditionally use the Sorrowful Mysteries.' },
  { weekday: 3, set: 'glorious', reason: 'Wednesdays traditionally use the Glorious Mysteries.' },
  { weekday: 4, set: 'luminous', reason: 'Thursdays traditionally use the Luminous Mysteries.' },
  { weekday: 5, set: 'sorrowful', reason: 'Fridays traditionally use the Sorrowful Mysteries.' },
  { weekday: 6, set: 'joyful', reason: 'Saturdays traditionally use the Joyful Mysteries.' },
  { weekday: 0, set: 'glorious', reason: 'Sundays traditionally use the Glorious Mysteries.' },
];

/**
 * The seasons the hybrid rule gives to the Church's calendar rather than to
 * the day of the week. Ordinary Time is deliberately not in this list: it is
 * six months of ordinary weeks, and the weekly cycle gives it the variety it
 * needs.
 */
const SEASON_DECIDES: Season[] = [
  'advent',
  'christmas',
  'lent',
  'holy-week',
  'easter',
];

interface FixedDateOverride {
  key: string;
  set: MysterySetId;
  /** A full sentence explaining the day's mystery. */
  sentence: string;
}

/**
 * Feasts whose celebration changes the mystery set regardless of the rule.
 * Edit this table to match the local practice you want to follow.
 */
export const FIXED_DATE_OVERRIDES: FixedDateOverride[] = [
  {
    key: '01-01',
    set: 'joyful',
    sentence: 'Today is the Solemnity of Mary, Mother of God.',
  },
  {
    key: '08-15',
    set: 'joyful',
    sentence:
      'Today is the Feast of the Assumption of the Blessed Virgin Mary.',
  },
  {
    key: '09-15',
    set: 'sorrowful',
    sentence: 'Today is the Feast of Our Lady of Sorrows.',
  },
  {
    key: '10-07',
    set: 'joyful',
    sentence: 'Today is the Feast of Our Lady of the Rosary.',
  },
  {
    key: '11-01',
    set: 'joyful',
    sentence: 'Today is All Saints.',
  },
  {
    key: '11-02',
    set: 'glorious',
    sentence:
      "Today is All Souls' Day. The Rosary is traditionally omitted on this day, so the Glorious Mysteries are prayed in its place.",
  },
  {
    key: '12-08',
    set: 'joyful',
    sentence:
      'Today is the Feast of the Immaculate Conception of the Blessed Virgin Mary.',
  },
  {
    key: '12-25',
    set: 'joyful',
    sentence: 'Today is the Nativity of the Lord.',
  },
];

interface MovableOverride {
  id: string;
  set: MysterySetId;
  sentence: string;
  matches: (year: LiturgicalYear, date: Date) => boolean;
}

/** Feasts that move with Easter but still change the mystery set. */
export const MOVABLE_OVERRIDES: MovableOverride[] = [
  {
    id: 'corpus-christi',
    set: 'sorrowful',
    sentence:
      'Today is the Feast of the Most Holy Body and Blood of Christ.',
    matches: (year, date) => isSameDay(date, year.corpusChristi),
  },
  {
    id: 'sacred-heart',
    set: 'sorrowful',
    sentence: 'Today is the Most Sacred Heart of Jesus.',
    matches: (year, date) => isSameDay(date, addDaysSafe(year.corpusChristi, 6)),
  },
  {
    id: 'holy-saturday',
    set: 'sorrowful',
    sentence: 'Today is Holy Saturday, the day before Easter.',
    matches: (year, date) => isSameDay(date, year.holySaturday),
  },
];

function addDaysSafe(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}

export function resolveMysteries(date: Date): MysteryResolution {
  const year = date.getUTCFullYear();
  const lit = liturgicalYear(year);
  const season = seasonFor(date);
  const weekday = date.getUTCDay();
  const weekdayName = WEEKDAY_NAMES[weekday] ?? 'Sunday';

  const weekly =
    WEEKLY_SETS.find((entry) => entry.weekday === weekday) ?? WEEKLY_SETS[0]!;
  const seasonal = SEASON_SETS[season];

  const weeklyAlternative: MysteryAlternative = {
    set: weekly.set,
    title: MYSTERY_SET_TITLES[weekly.set],
    reason: weekly.reason,
    tradition: WEEKLY_TRADITION,
  };

  const seasonalAlternative: MysteryAlternative = {
    set: seasonal.set,
    title: MYSTERY_SET_TITLES[seasonal.set],
    reason: `The ${MYSTERY_SET_TITLES[seasonal.set]} are prayed during ${
      SEASON_LABELS[season]
    }.`,
    tradition: SEASON_TRADITION,
  };

  const base = {
    date,
    weekday: weekdayName,
    season,
    seasonLabel: SEASON_LABELS[season],
  };

  // 1. A feast whose day IS the mystery overrides everything.
  const fixed = FIXED_DATE_OVERRIDES.find(
    (entry) => entry.key === monthDayKey(date),
  );
  if (fixed) {
    return {
      ...base,
      set: fixed.set,
      title: MYSTERY_SET_TITLES[fixed.set],
      reason: fixed.sentence,
      source: 'feast',
      alternative: weeklyAlternative,
    };
  }

  // 2. A moveable feast — Corpus Christi, the Sacred Heart, Holy Saturday.
  const movable = MOVABLE_OVERRIDES.find((entry) => entry.matches(lit, date));
  if (movable) {
    return {
      ...base,
      set: movable.set,
      title: MYSTERY_SET_TITLES[movable.set],
      reason: movable.sentence,
      source: 'feast',
      alternative: weeklyAlternative,
    };
  }

  // 3. The rule in force.
  if (PRIMARY_RULE === 'weekly') {
    return {
      ...base,
      set: weekly.set,
      title: MYSTERY_SET_TITLES[weekly.set],
      reason: weekly.reason,
      source: 'week',
      alternative: seasonalAlternative,
    };
  }

  if (PRIMARY_RULE === 'liturgical') {
    return {
      ...base,
      set: seasonal.set,
      title: MYSTERY_SET_TITLES[seasonal.set],
      reason: `It is ${SEASON_LABELS[season]}, and the ${
        MYSTERY_SET_TITLES[seasonal.set]
      } are prayed throughout this season.`,
      source: 'season',
      alternative: weeklyAlternative,
    };
  }

  // 'hybrid' — the season decides where it has force; otherwise the week does.
  if (SEASON_DECIDES.includes(season)) {
    return {
      ...base,
      set: seasonal.set,
      title: MYSTERY_SET_TITLES[seasonal.set],
      reason: `It is ${SEASON_LABELS[season]}, and the ${
        MYSTERY_SET_TITLES[seasonal.set]
      } are prayed throughout this season.`,
      source: 'season',
      alternative: weeklyAlternative,
    };
  }

  return {
    ...base,
    set: weekly.set,
    title: MYSTERY_SET_TITLES[weekly.set],
    reason: weekly.reason,
    source: 'week',
    alternative: seasonalAlternative,
  };
}
