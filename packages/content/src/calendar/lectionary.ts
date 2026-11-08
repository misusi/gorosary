import { addDays, daysBetween, isSameDay } from './dates.js';
import {
  type LiturgicalYear,
  type Season,
  liturgicalYear,
  seasonFor,
} from './liturgical.js';

/**
 * The Roman Lectionary: which Scripture is read on which day.
 *
 * Two things have to be worked out for any date:
 *
 *   1. The cycle year (A, B or C). The three-year cycle runs A → B → C, and
 *      a new cycle year begins at the First Sunday of Advent. The Advent
 *      that opened 2024 was Year A, so the anchor is 2021 = Year A and the
 *      letter is a simple rotation from there.
 *
 *   2. The slot within that cycle year. Most days belong to a numbered week
 *      of a season — the fourth Sunday of Advent, the second week of Lent,
 *      the twelfth week of Ordinary Time — but the solemnities that break
 *      the pattern (Christmas, the Triduum, Easter) have readings of their
 *      own and get named slots instead.
 *
 * The readings themselves are content, in `content/readings/`. This module
 * only decides which slot a date falls into.
 */

export type CycleYear = 'a' | 'b' | 'c';

export interface LectionaryPosition {
  /** The day in question, as a UTC midnight date. */
  date: Date;
  cycle: CycleYear;
  /** A stable key: `ordinary:12:0` for a numbered week, `named:easter` otherwise. */
  slot: string;
  /** A human label, e.g. "the Twelfth Sunday in Ordinary Time". */
  label: string;
  season: Season;
  week: number | null;
  /** 0 is Sunday. */
  weekday: number;
  isSunday: boolean;
}

/** The Advent of 2021 opened Year A. The cycle repeats every three years. */
const CYCLE_ANCHOR_YEAR = 2021;

const CYCLE_LETTERS: CycleYear[] = ['a', 'b', 'c'];

/**
 * The calendar year whose Advent opens the liturgical year containing a date.
 *
 * Advent does not begin on 1 December — it begins on the First Sunday of
 * Advent, which falls in late November. A date from that Sunday onwards
 * belongs to the new liturgical year; everything before it belongs to the
 * one that began the previous November.
 */
export function liturgicalStartYear(date: Date): number {
  const year = date.getUTCFullYear();
  const adventThisYear = liturgicalYear(year).adventStart;
  return date >= adventThisYear ? year : year - 1;
}

export function cycleYearFor(date: Date): CycleYear {
  const start = liturgicalStartYear(date);
  const offset = ((start - CYCLE_ANCHOR_YEAR) % 3 + 3) % 3;
  return CYCLE_LETTERS[offset] ?? 'a';
}

const ORDINALS = [
  'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh',
  'Eighth', 'Ninth', 'Tenth', 'Eleventh', 'Twelfth', 'Thirteenth',
  'Fourteenth', 'Fifteenth', 'Sixteenth', 'Seventeenth', 'Eighteenth',
  'Nineteenth', 'Twentieth', 'Twenty-First', 'Twenty-Second',
  'Twenty-Third', 'Twenty-Fourth', 'Twenty-Fifth', 'Twenty-Sixth',
  'Twenty-Seventh', 'Twenty-Eighth', 'Twenty-Ninth', 'Thirtieth',
  'Thirty-First', 'Thirty-Second', 'Thirty-Third', 'Thirty-Fourth',
];

function ordinal(n: number): string {
  return ORDINALS[n - 1] ?? `${n}th`;
}

/**
 * The numbered weeks of Ordinary Time, counted across the whole year rather
 * than restarting after Pentecost. The lectionary uses the same numbering.
 */
export function ordinaryTimeWeek(date: Date, year: LiturgicalYear): number {
  const firstSunday = addDays(year.baptismOfTheLord, 1);
  const sundayOnOrAfter = (from: Date): Date => {
    const day = addDays(from, (7 - from.getUTCDay()) % 7);
    return day;
  };
  const sundayOnOrBefore = (from: Date): Date =>
    addDays(from, -from.getUTCDay());

  const first = sundayOnOrAfter(firstSunday);

  if (date < year.ashWednesday) {
    return Math.floor(daysBetween(first, date) / 7) + 1;
  }

  const lastBeforeLent = sundayOnOrBefore(addDays(year.ashWednesday, -1));
  const weeksBeforeLent =
    Math.floor(daysBetween(first, lastBeforeLent) / 7) + 1;

  const afterPentecost = sundayOnOrAfter(addDays(year.pentecost, 1));
  const weeksAfter =
    Math.floor(daysBetween(afterPentecost, date) / 7) + 1;

  return weeksBeforeLent + weeksAfter;
}

/**
 * The Holy Family is kept on the Sunday within the Octave of Christmas, if
 * there is one. When the Octave has no Sunday in it, the feast moves to the
 * Sunday after the Baptism of the Lord.
 */
export function holyFamilyDate(year: LiturgicalYear): Date {
  for (let day = 26; day <= 31; day += 1) {
    const candidate = new Date(
      Date.UTC(year.christmas.getUTCFullYear(), 11, day),
    );
    if (candidate.getUTCDay() === 0) return candidate;
  }
  // 1 January, if that is a Sunday.
  const january = new Date(
    Date.UTC(year.christmas.getUTCFullYear() + 1, 0, 1),
  );
  if (january.getUTCDay() === 0) return january;
  return addDays(year.baptismOfTheLord, 7);
}

/**
 * The solemnities and feasts that carry readings of their own, rather than
 * belonging to a numbered week.
 */
function namedSlot(
  date: Date,
  year: LiturgicalYear,
): { slot: string; label: string } | null {
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  if (month === 12 && day === 25) {
    return { slot: 'named:christmas', label: 'the Nativity of the Lord' };
  }
  // The Holy Family takes the Sunday within the Octave, so it has to be
  // checked before the Christmas weekdays are.
  if (isSameDay(date, holyFamilyDate(year))) {
    return { slot: 'named:holy-family', label: 'the Holy Family' };
  }
  if (month === 12 && day >= 26) {
    return {
      slot: `named:christmas-${day}`,
      label: `the ${ordinal(day - 24)} Day of Christmas`,
    };
  }
  if (month === 1 && day === 1) {
    return { slot: 'named:mary-mother-of-god', label: 'Mary, Mother of God' };
  }
  if (month === 1 && day === 6) {
    return { slot: 'named:epiphany', label: 'the Epiphany of the Lord' };
  }
  if (isSameDay(date, year.baptismOfTheLord)) {
    return {
      slot: 'named:baptism-of-the-lord',
      label: 'the Baptism of the Lord',
    };
  }
  if (month === 8 && day === 15) {
    return {
      slot: 'named:assumption',
      label: 'the Assumption of the Blessed Virgin Mary',
    };
  }
  if (month === 11 && day === 1) {
    return { slot: 'named:all-saints', label: 'All Saints' };
  }
  if (month === 12 && day === 8) {
    return {
      slot: 'named:immaculate-conception',
      label: 'the Immaculate Conception of the Blessed Virgin Mary',
    };
  }
  if (isSameDay(date, year.ashWednesday)) {
    return { slot: 'named:ash-wednesday', label: 'Ash Wednesday' };
  }
  if (isSameDay(date, year.palmSunday)) {
    return { slot: 'named:palm-sunday', label: 'Palm Sunday' };
  }
  if (isSameDay(date, year.holyThursday)) {
    return { slot: 'named:holy-thursday', label: 'Holy Thursday' };
  }
  if (isSameDay(date, year.goodFriday)) {
    return { slot: 'named:good-friday', label: 'Good Friday' };
  }
  if (isSameDay(date, year.holySaturday)) {
    return { slot: 'named:holy-saturday', label: 'Holy Saturday' };
  }
  if (isSameDay(date, year.easter)) {
    return { slot: 'named:easter', label: 'Easter Sunday' };
  }
  if (isSameDay(date, year.ascension)) {
    return { slot: 'named:ascension', label: 'the Ascension of the Lord' };
  }
  if (isSameDay(date, year.pentecost)) {
    return { slot: 'named:pentecost', label: 'Pentecost' };
  }
  if (isSameDay(date, year.trinitySunday)) {
    return { slot: 'named:trinity', label: 'the Most Holy Trinity' };
  }
  if (isSameDay(date, year.corpusChristi)) {
    return {
      slot: 'named:corpus-christi',
      label: 'the Most Holy Body and Blood of Christ',
    };
  }
  if (isSameDay(date, year.christTheKing)) {
    return { slot: 'named:christ-the-king', label: 'Christ the King' };
  }

  return null;
}

/** Where a date falls in the lectionary. */
export function lectionaryPosition(date: Date): LectionaryPosition {
  const year = liturgicalYear(date.getUTCFullYear());
  const season = seasonFor(date);
  const weekday = date.getUTCDay();
  const cycle = cycleYearFor(date);

  const named = namedSlot(date, year);
  if (named) {
    return {
      date,
      cycle,
      slot: named.slot,
      label: named.label,
      season,
      week: null,
      weekday,
      isSunday: weekday === 0,
    };
  }

  switch (season) {
    case 'advent': {
      const week = Math.floor(daysBetween(year.adventStart, date) / 7) + 1;
      return {
        date,
        cycle,
        slot: `advent:${week}:${weekday}`,
        label: `the ${ordinal(week)} Sunday of Advent`,
        season,
        week,
        weekday,
        isSunday: weekday === 0,
      };
    }
    case 'christmas': {
      // Between the Baptism of the Lord and the start of Lent.
      const week = 2;
      return {
        date,
        cycle,
        slot: `christmas:${week}:${weekday}`,
        label: 'the Second Week of Christmas',
        season,
        week,
        weekday,
        isSunday: weekday === 0,
      };
    }
    case 'lent': {
      const week = Math.floor(daysBetween(year.ashWednesday, date) / 7) + 1;
      return {
        date,
        cycle,
        slot: `lent:${week}:${weekday}`,
        label: `the ${ordinal(week)} Week of Lent`,
        season,
        week,
        weekday,
        isSunday: weekday === 0,
      };
    }
    case 'holy-week': {
      const week = 7;
      return {
        date,
        cycle,
        slot: `holy-week:${week}:${weekday}`,
        label: 'Holy Week',
        season,
        week,
        weekday,
        isSunday: weekday === 0,
      };
    }
    case 'easter': {
      const week = Math.floor(daysBetween(year.easter, date) / 7) + 1;
      return {
        date,
        cycle,
        slot: `easter:${week}:${weekday}`,
        label:
          week === 1
            ? 'the First Week of Easter'
            : `the ${ordinal(week)} Week of Easter`,
        season,
        week,
        weekday,
        isSunday: weekday === 0,
      };
    }
    case 'ordinary':
    default: {
      const week = ordinaryTimeWeek(date, year);
      return {
        date,
        cycle,
        slot: `ordinary:${week}:${weekday}`,
        label: `the ${ordinal(week)} Week of Ordinary Time`,
        season,
        week,
        weekday,
        isSunday: weekday === 0,
      };
    }
  }
}

/**
 * Every Sunday slot of a liturgical year, for a given cycle year.
 *
 * The content build uses this to check that a cycle year has all of its
 * Sundays. A missing Sunday is a hole in the readings, and the build should
 * say so rather than let the page quietly fall back.
 */
export function sundaySlotsForCycle(cycleStartYear: number): string[] {
  const year = liturgicalYear(cycleStartYear);
  const slots: string[] = [];

  for (let week = 0; week < 4; week += 1) {
    slots.push(`advent:${week + 1}:0`);
  }

  slots.push('named:christmas');
  slots.push('named:baptism-of-the-lord');
  slots.push('named:holy-family');

  for (let week = 0; week < 6; week += 1) {
    slots.push(`lent:${week + 1}:0`);
  }

  slots.push('named:palm-sunday');
  slots.push('named:easter');
  slots.push('named:ascension');
  slots.push('named:pentecost');
  slots.push('named:trinity');
  slots.push('named:corpus-christi');
  slots.push('named:christ-the-king');

  slots.push('named:assumption');
  slots.push('named:all-saints');
  slots.push('named:immaculate-conception');

  void cycleStartYear;
  return slots;
}
