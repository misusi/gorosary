import {
  addDays,
  daysBetween,
  isSameDay,
} from './dates.js';
import {
  type LiturgicalYear,
  type Season,
  liturgicalYear,
  ordinaryTimeWeek,
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
  /**
   * The colours of the day.
   *
   * The celebration kept today brings its own colour, and the weekday of the
   * season keeps its colour underneath it. Both are shown when they differ.
   */
  colours: DayColour[];
  commemorations: Commemoration[];
  fasts: Fast[];
  vigils: Commemoration[];
}

/** One of the colours of the day, with the words that go with it. */
export interface DayColour {
  colour: LiturgicalColour;
  /** "White" */
  label: string;
  /** "The colour of joy — Christ, the saints, and the Blessed Virgin." */
  note: string;
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
 * What each colour means.
 *
 * The words live here rather than in the apps, so that the website and the
 * phone cannot drift apart on the one sentence that explains the colour.
 */
const COLOUR_NOTES: Record<LiturgicalColour, string> = {
  white: 'The colour of joy — Christ, the saints, and the Blessed Virgin.',
  violet: 'The colour of preparation and penance.',
  red: 'The colour of the Spirit, of the Passion, and of martyrs.',
  green: 'The colour of Ordinary Time — growth, hope, and the kingdom.',
  black: 'The colour of mourning, for the dead.',
  rose: 'The colour of the third Sunday of Lent, halfway through the fast.',
};

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

/**
 * The colour of the weekday itself, whatever is kept on it.
 *
 * This is the colour of the season: green in Ordinary Time, violet in
 * Advent and Lent, white at Christmas and Easter, red through the Passion.
 */
function weekdayColour(
  date: Date,
  year: LiturgicalYear,
  season: Season,
): LiturgicalColour {
  switch (season) {
    case 'ordinary':
      return 'green';
    case 'advent':
      return 'violet';
    case 'lent': {
      // Laetare Sunday, the fourth Sunday of Lent.
      const fourthSunday = addDays(year.ashWednesday, 4 + 7 * 3);
      return isSameDay(date, fourthSunday) ? 'rose' : 'violet';
    }
    case 'holy-week':
      return isSameDay(date, year.holyThursday) ? 'white' : 'red';
    case 'easter':
      return isSameDay(date, year.pentecost) ? 'red' : 'white';
    case 'christmas':
    default:
      return 'white';
  }
}

/**
 * The colour of the celebration kept today, if there is one.
 *
 * A solemnity or a feast always brings its colour. An obligatory memorial
 * brings one only on an ordinary weekday of Ordinary Time: in Advent,
 * Christmas, Lent and Easter the season is kept instead, and the memorial
 * is only mentioned.
 */
function celebrationColour(
  date: Date,
  year: LiturgicalYear,
  season: Season,
  commemorations: Commemoration[],
): LiturgicalColour | null {
  // All Saints and All Souls are known by their date, so the engine can
  // answer for them without the content.
  if (isSameDay(date, year.allSaints)) return 'white';
  // All Souls' Day is the one commemoration of the dead, and it is black.
  if (date.getUTCMonth() === 10 && date.getUTCDate() === 2) return 'black';

  const feast = commemorations.find(
    (entry) => entry.kind === 'solemnity' || entry.kind === 'feast',
  );
  if (feast) return colourOf(feast);

  if (season === 'ordinary' && date.getUTCDay() !== 0) {
    const memorial = commemorations.find((entry) => entry.kind === 'memorial');
    if (memorial) return colourOf(memorial);
  }

  return null;
}

/** The colour a particular celebration is kept in. */
function colourOf(entry: Commemoration): LiturgicalColour {
  const text = `${entry.name} ${entry.note ?? ''}`;
  // Martyrs are celebrated in red, and so are Pentecost and the Sacred
  // Heart, which are the work of the Spirit and of the love that was
  // pierced.
  if (/martyr|Passion of|Pentecost|Sacred Heart/i.test(text)) return 'red';
  return 'white';
}

/**
 * The colours of the day, in the order they should be shown.
 *
 * The celebration kept today brings its own colour, and the weekday of the
 * season keeps its colour underneath it: an ordinary weekday in Ordinary
 * Time is green, and a saint's feast kept on that weekday is white. Both are
 * true of the day, so both are shown — the celebration's colour first, and
 * one entry alone when they are the same colour.
 */
function coloursFor(
  date: Date,
  year: LiturgicalYear,
  season: Season,
  commemorations: Commemoration[],
): DayColour[] {
  const weekday = weekdayColour(date, year, season);
  const celebration = celebrationColour(date, year, season, commemorations);

  const colour = (value: LiturgicalColour): DayColour => ({
    colour: value,
    label: COLOUR_LABELS[value],
    note: COLOUR_NOTES[value],
  });

  if (celebration === null || celebration === weekday) {
    return [colour(weekday)];
  }

  return [colour(celebration), colour(weekday)];
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

/**
 * Everything the Church's calendar says about one day.
 *
 * The argument is a *day*, not an instant: a date pinned to UTC midnight,
 * the way `localToday()` and `utcDate()` produce it. The engine reads the
 * year, month and day in UTC, so handing it a raw point in time would
 * answer for whatever day that instant had reached in UTC — which is a day
 * ahead for anyone east of Greenwich in the evening.
 *
 * The commemorations may be given, because the fixed-date saints live in
 * the content and only the caller can reach them. Without them the day is
 * described with the feasts that move with Easter, which is enough for
 * everything but the colour of a saint's feast.
 */
export function describeDay(
  day: Date,
  kept?: Commemoration[],
): DayDescription {
  const date = new Date(
    Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate()),
  );
  const year = liturgicalYear(date.getUTCFullYear());
  const season = seasonFor(date);
  const commemorations = kept ?? moveableFeastsFor(date);

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
    colours: coloursFor(date, year, season, commemorations),
    commemorations,
    fasts: fastsFor(date, year),
    vigils: vigilsFor(date, year),
  };
}
