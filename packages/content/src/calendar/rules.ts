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
 * Two traditions are in play and they are not always the same:
 *
 *   1. The liturgical cycle (PRIMARY). The mystery set follows the season of
 *      the Church's calendar: Joyful in Advent, Christmas and Ordinary Time,
 *      Sorrowful in Lent and Holy Week, Glorious in the Easter season.
 *      Certain feasts override the season.
 *
 *   2. The weekly cycle (ALTERNATIVE). The classic day-of-week assignment:
 *      Mon/Sat Joyful, Tue/Fri Sorrowful, Wed/Sun Glorious, Thu Luminous.
 *
 * We surface the liturgical set as the primary answer and always show the
 * weekly set as an alternative, because a person praying at home expects to
 * see the day-of-week answer and the app should not pick a fight with them.
 *
 * To flip the primary rule, change PRIMARY_RULE below. Everything else is data.
 */

export type PrimaryRule = 'liturgical' | 'weekly';

export const PRIMARY_RULE: PrimaryRule = 'liturgical';

export interface MysteryResolution {
  date: Date;
  weekday: string;
  season: Season;
  seasonLabel: string;
  set: MysterySetId;
  reason: string;
  /** Secondary tradition, shown alongside but never replacing the primary. */
  alternative: { set: MysterySetId; reason: string };
  /** True when the primary answer came from the weekly cycle. */
  fromWeeklyCycle: boolean;
}

const SEASON_SETS: Record<Season, { set: MysterySetId; reason: string }> = {
  advent: {
    set: 'joyful',
    reason: 'the Joyful Mysteries are prayed during Advent',
  },
  christmas: {
    set: 'joyful',
    reason: 'the Joyful Mysteries are prayed during the Christmas season',
  },
  lent: {
    set: 'sorrowful',
    reason: 'the Sorrowful Mysteries are prayed during Lent',
  },
  'holy-week': {
    set: 'sorrowful',
    reason: 'the Sorrowful Mysteries are prayed during Holy Week',
  },
  easter: {
    set: 'glorious',
    reason: 'the Glorious Mysteries are prayed during the Easter season',
  },
  ordinary: {
    set: 'joyful',
    reason: 'the Joyful Mysteries are prayed during Ordinary Time',
  },
};

const WEEKLY_SETS: { weekday: number; set: MysterySetId; reason: string }[] = [
  { weekday: 1, set: 'joyful', reason: 'Mondays traditionally use the Joyful Mysteries' },
  { weekday: 2, set: 'sorrowful', reason: 'Tuesdays traditionally use the Sorrowful Mysteries' },
  { weekday: 3, set: 'glorious', reason: 'Wednesdays traditionally use the Glorious Mysteries' },
  { weekday: 4, set: 'luminous', reason: 'Thursdays traditionally use the Luminous Mysteries' },
  { weekday: 5, set: 'sorrowful', reason: 'Fridays traditionally use the Sorrowful Mysteries' },
  { weekday: 6, set: 'joyful', reason: 'Saturdays traditionally use the Joyful Mysteries' },
  { weekday: 0, set: 'glorious', reason: 'Sundays traditionally use the Glorious Mysteries' },
];

interface FixedDateOverride {
  key: string;
  set: MysterySetId;
  reason: string;
}

/**
 * Feasts whose celebration changes the mystery set regardless of season.
 * Edit this table to match the local practice you want to follow.
 */
export const FIXED_DATE_OVERRIDES: FixedDateOverride[] = [
  {
    key: '01-01',
    set: 'joyful',
    reason: 'the Solemnity of Mary, Mother of God',
  },
  {
    key: '08-15',
    set: 'joyful',
    reason: 'the Feast of the Assumption of the Blessed Virgin Mary',
  },
  {
    key: '09-15',
    set: 'sorrowful',
    reason: 'the Feast of Our Lady of Sorrows',
  },
  {
    key: '10-07',
    set: 'joyful',
    reason: 'the Feast of Our Lady of the Rosary',
  },
  {
    key: '11-01',
    set: 'joyful',
    reason: 'All Saints',
  },
  {
    key: '11-02',
    set: 'glorious',
    reason:
      "All Souls' Day — the Rosary is traditionally omitted today, so the Glorious Mysteries are prayed in its place",
  },
  {
    key: '12-08',
    set: 'joyful',
    reason: 'the Feast of the Immaculate Conception of the Blessed Virgin Mary',
  },
  {
    key: '12-25',
    set: 'joyful',
    reason: 'the Nativity of the Lord',
  },
];

interface MovableOverride {
  id: string;
  set: MysterySetId;
  reason: string;
  matches: (year: LiturgicalYear, date: Date) => boolean;
}

/** Feasts that move with Easter but still change the mystery set. */
export const MOVABLE_OVERRIDES: MovableOverride[] = [
  {
    id: 'corpus-christi',
    set: 'sorrowful',
    reason: 'the Feast of the Most Holy Body and Blood of Christ',
    matches: (year, date) => isSameDay(date, year.corpusChristi),
  },
  {
    id: 'sacred-heart',
    set: 'sorrowful',
    reason: 'the Most Sacred Heart of Jesus',
    matches: (year, date) => isSameDay(date, addDaysSafe(year.corpusChristi, 6)),
  },
  {
    id: 'holy-saturday',
    set: 'sorrowful',
    reason: 'Holy Saturday, the day before Easter',
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
    WEEKLY_SETS.find((entry) => entry.weekday === weekday) ??
    WEEKLY_SETS[0]!;

  const alternative = {
    set: weekly.set,
    reason: weekly.reason,
  };

  const fixed = FIXED_DATE_OVERRIDES.find(
    (entry) => entry.key === monthDayKey(date),
  );
  if (fixed) {
    return {
      date,
      weekday: weekdayName,
      season,
      seasonLabel: SEASON_LABELS[season],
      set: fixed.set,
      reason: fixed.reason,
      alternative,
      fromWeeklyCycle: false,
    };
  }

  const movable = MOVABLE_OVERRIDES.find((entry) => entry.matches(lit, date));
  if (movable) {
    return {
      date,
      weekday: weekdayName,
      season,
      seasonLabel: SEASON_LABELS[season],
      set: movable.set,
      reason: movable.reason,
      alternative,
      fromWeeklyCycle: false,
    };
  }

  if (PRIMARY_RULE === 'weekly') {
    return {
      date,
      weekday: weekdayName,
      season,
      seasonLabel: SEASON_LABELS[season],
      set: weekly.set,
      reason: weekly.reason,
      alternative: {
        set: SEASON_SETS[season].set,
        reason: SEASON_SETS[season].reason,
      },
      fromWeeklyCycle: true,
    };
  }

  return {
    date,
    weekday: weekdayName,
    season,
    seasonLabel: SEASON_LABELS[season],
    set: SEASON_SETS[season].set,
    reason: SEASON_SETS[season].reason,
    alternative,
    fromWeeklyCycle: false,
  };
}
