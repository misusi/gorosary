import {
  addDays,
  sundayOnOrAfter,
  utcDate,
} from './dates.js';

/**
 * The Roman Catholic liturgical year.
 *
 * The year is not fixed: Easter moves, and every movable feast hangs off it.
 * We compute Easter with the anonymous Gregorian algorithm (valid for 1583-4099),
 * then derive the rest.
 */

export type Season =
  | 'advent'
  | 'christmas'
  | 'lent'
  | 'holy-week'
  | 'easter'
  | 'ordinary';

export const SEASON_LABELS: Record<Season, string> = {
  advent: 'Advent',
  christmas: 'Christmas',
  lent: 'Lent',
  'holy-week': 'Holy Week',
  easter: 'Easter',
  ordinary: 'Ordinary Time',
};

export interface LiturgicalYear {
  year: number;
  easter: Date;
  ashWednesday: Date;
  palmSunday: Date;
  holyThursday: Date;
  goodFriday: Date;
  holySaturday: Date;
  ascension: Date;
  pentecost: Date;
  trinitySunday: Date;
  corpusChristi: Date;
  christTheKing: Date;
  baptismOfTheLord: Date;
  epiphany: Date;
  adventStart: Date;
  christmas: Date;
  assumption: Date;
  allSaints: Date;
  immaculateConception: Date;
  candlemas: Date;
}

/** Gregorian Easter Sunday (anonymous Gregorian algorithm). */
export function easterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return utcDate(year, month, day);
}

/**
 * The First Sunday of Advent is the Sunday closest to November 30.
 * Advent then runs for three full weeks until Christmas Eve.
 */
export function adventStart(year: number): Date {
  const nov30 = utcDate(year, 11, 30);
  const weekday = nov30.getUTCDay();
  const before = addDays(nov30, -weekday);
  const after = addDays(before, 7);
  return weekday <= 7 - weekday ? before : after;
}

/**
 * The Baptism of the Lord falls on the Sunday between January 7 and January 13.
 * It closes the Christmas season.
 */
export function baptismOfTheLord(year: number): Date {
  return sundayOnOrAfter(utcDate(year, 1, 7));
}

export function liturgicalYear(year: number): LiturgicalYear {
  const easter = easterDate(year);
  const corpusChristi = addDays(easter, 60);

  return {
    year,
    easter,
    ashWednesday: addDays(easter, -46),
    palmSunday: addDays(easter, -7),
    holyThursday: addDays(easter, -3),
    goodFriday: addDays(easter, -2),
    holySaturday: addDays(easter, -1),
    ascension: addDays(easter, 39),
    pentecost: addDays(easter, 49),
    trinitySunday: addDays(easter, 56),
    corpusChristi,
    // Christ the King is celebrated on the last Sunday of Ordinary Time —
    // the Sunday immediately before the First Sunday of Advent.
    christTheKing: addDays(adventStart(year), -7),
    baptismOfTheLord: baptismOfTheLord(year),
    epiphany: utcDate(year, 1, 6),
    adventStart: adventStart(year),
    christmas: utcDate(year, 12, 25),
    assumption: utcDate(year, 8, 15),
    allSaints: utcDate(year, 11, 1),
    immaculateConception: utcDate(year, 12, 8),
    candlemas: utcDate(year, 2, 2),
  };
}

/**
 * Which season a given day falls in.
 *
 * Christmas Time straddles the new year, so both the current and the previous
 * liturgical year have to be consulted.
 */
export function seasonFor(date: Date): Season {
  const year = date.getUTCFullYear();
  const current = liturgicalYear(year);
  const previous = liturgicalYear(year - 1);

  if (date >= current.adventStart && date < current.christmas) {
    return 'advent';
  }
  if (
    date >= current.christmas ||
    // The Christmas season ends with the Baptism of the Lord, which is
    // therefore its last day rather than the first day of Ordinary Time.
    (date >= previous.christmas && date <= current.baptismOfTheLord)
  ) {
    return 'christmas';
  }
  if (date >= current.ashWednesday && date < current.palmSunday) {
    return 'lent';
  }
  if (date >= current.palmSunday && date < current.easter) {
    return 'holy-week';
  }
  // The Easter season runs from Easter Sunday through Pentecost inclusive.
  if (date >= current.easter && date <= current.pentecost) {
    return 'easter';
  }
  return 'ordinary';
}

/** The saint of the day for a date, matched against a fixed-date table. */
export interface FixedFeast {
  month: number;
  day: number;
  name: string;
  kind?: 'solemnity' | 'feast' | 'memorial' | 'optional-memorial';
  note?: string;
}
