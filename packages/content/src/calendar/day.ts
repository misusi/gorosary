import {
  addDays,
  daysBetween,
  isSameDay,
  sundayOnOrAfter,
  sundayOnOrBefore,
} from './dates.js';
import {
  type LiturgicalYear,
  type Season,
  liturgicalYear,
  seasonFor,
} from './liturgical.js';
import { moveableFeastsFor, type Commemoration } from './feasts.js';

/**
 * Everything the Church's calendar says about one particular day.
 *
 * The calendar pages explain the year; this describes today. It is what the
 * home page shows so that someone landing on the site knows where they are in
 * the liturgical year, what is kept, and whether they are fasting.
 */

export type LiturgicalColour =
  | 'white'
  | 'violet'
  | 'red'
  | 'green'
  | 'black'
  | 'rose';

export interface Fast {
  name: string;
  note: string;
}

export interface DayDescription {
  date: Date;
  season: Season;
  seasonLabel: string;
  /** Where in the season we are, e.g. "the Third Sunday of Advent". */
  weekLabel: string;
  colour: LiturgicalColour;
  colourLabel: string;
  commemorations: Commemoration[];
  fasts: Fast[];
  vigils: Commemoration[];
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

const COLOUR_LABELS: Record<LiturgicalColour, string> = {
  white: 'White',
  violet: 'Violet',
  red: 'Red',
  green: 'Green',
  black: 'Black',
  rose: 'Rose',
};

/**
 * The Sunday of the week a date falls in, counted the classical way.
 *
 * Ordinary Time is numbered 1 to 34 across the whole year, so the count
 * continues across Lent and Easter rather than restarting after Pentecost.
 */
function ordinaryTimeWeek(date: Date, year: LiturgicalYear): number {
  const firstSunday = sundayOnOrAfter(addDays(year.baptismOfTheLord, 1));

  if (date < year.ashWednesday) {
    return Math.floor(daysBetween(firstSunday, date) / 7) + 1;
  }

  const lastSundayBeforeLent = sundayOnOrBefore(addDays(year.ashWednesday, -1));
  const weeksBeforeLent =
    Math.floor(daysBetween(firstSunday, lastSundayBeforeLent) / 7) + 1;

  const firstSundayAfterPentecost = sundayOnOrAfter(addDays(year.pentecost, 1));
  const weeksAfterPentecost =
    Math.floor(daysBetween(firstSundayAfterPentecost, date) / 7) + 1;

  return weeksBeforeLent + weeksAfterPentecost;
}

function weekLabel(date: Date, year: LiturgicalYear, season: Season): string {
  const isSunday = date.getUTCDay() === 0;

  switch (season) {
    case 'advent': {
      const week = Math.floor(daysBetween(year.adventStart, date) / 7) + 1;
      return `the ${ordinal(week)} Sunday of Advent`;
    }
    case 'christmas': {
      const month = date.getUTCMonth() + 1;
      const day = date.getUTCDate();
      if (month === 12) {
        if (day === 25) return 'Christmas Day';
        return `the ${ordinal(day - 24)} Day of Christmas`;
      }
      if (day === 1) return 'the Octave Day of Christmas';
      return 'the Second Week of Christmas';
    }
    case 'lent': {
      const week = Math.floor(daysBetween(year.ashWednesday, date) / 7) + 1;
      return isSunday
        ? `the ${ordinal(week)} Sunday of Lent`
        : `the ${ordinal(week)} Week of Lent`;
    }
    case 'holy-week': {
      if (isSameDay(date, year.palmSunday)) return 'Palm Sunday';
      if (isSameDay(date, year.holyThursday)) return 'Holy Thursday';
      if (isSameDay(date, year.goodFriday)) return 'Good Friday';
      if (isSameDay(date, year.holySaturday)) return 'Holy Saturday';
      return 'the Second Week of Holy Week';
    }
    case 'easter': {
      const day = daysBetween(year.easter, date);
      if (day === 0) return 'Easter Sunday';
      if (day === 49) return 'Pentecost';
      if (day < 7) return `the ${ordinal(day + 1)} Day of Easter`;
      const week = Math.floor(day / 7) + 1;
      return isSunday
        ? `the ${ordinal(week)} Sunday of Easter`
        : `the ${ordinal(week)} Week of Easter`;
    }
    case 'ordinary':
    default: {
      const week = ordinaryTimeWeek(date, year);
      return isSunday
        ? `the ${ordinal(week)} Sunday in Ordinary Time`
        : `the ${ordinal(week)} Week of Ordinary Time`;
    }
  }
}

function colourFor(
  date: Date,
  year: LiturgicalYear,
  season: Season,
  commemorations: Commemoration[],
): LiturgicalColour {
  if (isSameDay(date, year.allSaints)) return 'white';
  if (date.getUTCMonth() === 10 && date.getUTCDate() === 2) return 'black';

  switch (season) {
    case 'ordinary':
      return 'green';
    case 'advent':
      return 'violet';
    case 'lent': {
      if (isSameDay(date, year.palmSunday)) return 'red';
      if (isSameDay(date, year.goodFriday)) return 'red';
      if (isSameDay(date, year.holyThursday)) return 'white';
      // Laetare Sunday, the fourth Sunday of Lent.
      const fourthSunday = addDays(year.ashWednesday, 4 + 7 * 3);
      if (isSameDay(date, fourthSunday)) return 'rose';
      return 'violet';
    }
    case 'holy-week': {
      if (isSameDay(date, year.holyThursday)) return 'white';
      return 'red';
    }
    case 'easter':
      return isSameDay(date, year.pentecost) ? 'red' : 'white';
    case 'christmas':
    default:
      // Feasts of martyrs are celebrated in red.
      if (
        commemorations.some((entry) =>
          /martyr|Passion of/i.test(`${entry.name} ${entry.note ?? ''}`),
        )
      ) {
        return 'red';
      }
      return 'white';
  }
}

function vigilsFor(date: Date, year: LiturgicalYear): Commemoration[] {
  const vigils: Commemoration[] = [];
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  if (month === 12 && day === 24) {
    vigils.push({
      name: 'The Vigil of Christmas',
      kind: 'commemoration',
      note: 'The Christmas Vigil, held after sunset.',
    });
  }
  if (month === 10 && day === 31) {
    vigils.push({
      name: 'The Vigil of All Saints',
      kind: 'commemoration',
      note: 'The All Saints Vigil, held after sunset.',
    });
  }
  if (isSameDay(date, year.holySaturday)) {
    vigils.push({
      name: 'The Easter Vigil',
      kind: 'commemoration',
      note: 'The greatest liturgy of the year, held after sunset.',
    });
  }
  if (isSameDay(date, addDays(year.pentecost, -1))) {
    vigils.push({
      name: 'The Vigil of Pentecost',
      kind: 'commemoration',
      note: 'Held after sunset, the Vigil of the gift of the Holy Spirit.',
    });
  }

  return vigils;
}

function fastsFor(date: Date, year: LiturgicalYear): Fast[] {
  const fasts: Fast[] = [];
  const weekday = date.getUTCDay();

  if (isSameDay(date, year.ashWednesday)) {
    fasts.push({
      name: 'Ash Wednesday',
      note: 'A day of fast and abstinence from meat.',
    });
  }

  if (weekday === 5) {
    if (date >= year.ashWednesday && date < year.easter) {
      fasts.push({
        name: 'Friday in Lent',
        note: 'A day of fast and abstinence from meat.',
      });
    } else if (date >= year.adventStart && date < year.christmas) {
      fasts.push({
        name: 'Friday in Advent',
        note: 'A day of fast, and by long custom, abstinence from meat.',
      });
    }
  }

  if (isSameDay(date, year.goodFriday)) {
    fasts.push({
      name: 'Good Friday',
      note: 'A day of fast and abstinence from meat.',
    });
  }

  if (date.getUTCMonth() === 11 && date.getUTCDate() === 24) {
    fasts.push({
      name: 'Christmas Eve',
      note: 'A day of fast and abstinence from meat.',
    });
  }

  if (date.getUTCMonth() === 10 && date.getUTCDate() === 2) {
    fasts.push({
      name: "All Souls' Day",
      note: 'A day of fast and abstinence from meat.',
    });
  }

  // The Ember Days are the Wednesday and Friday after the First Sunday of
  // Lent. Since 1966 they fall after the Third Sunday, but the fast was
  // kept on the first Wednesday and Friday of Lent for centuries.
  const firstSundayOfLent = addDays(year.ashWednesday, 4);
  const emberWednesday = addDays(firstSundayOfLent, 3);
  const emberFriday = addDays(firstSundayOfLent, 5);
  if (isSameDay(date, emberWednesday) || isSameDay(date, emberFriday)) {
    fasts.push({
      name: 'Ember Day',
      note: 'One of the four Ember Days, a day of fast and abstinence from meat.',
    });
  }

  return fasts;
}

export function describeDay(instant: Date): DayDescription {
  const date = new Date(
    Date.UTC(
      instant.getUTCFullYear(),
      instant.getUTCMonth(),
      instant.getUTCDate(),
    ),
  );
  const year = liturgicalYear(date.getUTCFullYear());
  const season = seasonFor(date);
  const commemorations = moveableFeastsFor(date);
  const colour = colourFor(date, year, season, commemorations);

  return {
    date,
    season,
    seasonLabel: {
      advent: 'Advent',
      christmas: 'Christmas',
      lent: 'Lent',
      'holy-week': 'Holy Week',
      easter: 'Easter',
      ordinary: 'Ordinary Time',
    }[season],
    weekLabel: weekLabel(date, year, season),
    colour,
    colourLabel: COLOUR_LABELS[colour],
    commemorations,
    fasts: fastsFor(date, year),
    vigils: vigilsFor(date, year),
  };
}
