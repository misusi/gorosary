import { isSameDay } from './dates.js';
import { liturgicalYear } from './liturgical.js';

/**
 * Feasts that move with Easter.
 *
 * Fixed-date commemorations live in `content/calendar/saints-of-the-year.md`
 * where they can be edited without touching code. Only the movable ones need
 * to be computed, so they live here.
 */

export type CommemorationKind =
  | 'solemnity'
  | 'feast'
  | 'memorial'
  | 'optional-memorial'
  | 'commemoration';

export interface Commemoration {
  name: string;
  kind: CommemorationKind;
  note?: string;
}

interface MoveableFeast {
  name: string;
  kind: CommemorationKind;
  note?: string;
  date: (year: ReturnType<typeof liturgicalYear>) => Date;
}

const MS_PER_DAY = 86_400_000;
const shift = (date: Date, days: number): Date =>
  new Date(date.getTime() + days * MS_PER_DAY);

export const MOVEABLE_FEASTS: MoveableFeast[] = [
  {
    name: 'First Sunday of Advent',
    kind: 'commemoration',
    note: 'The liturgical year begins.',
    date: (year) => year.adventStart,
  },
  {
    name: 'Second Sunday of Advent',
    kind: 'commemoration',
    date: (year) => shift(year.adventStart, 7),
  },
  {
    name: 'Third Sunday of Advent',
    kind: 'commemoration',
    date: (year) => shift(year.adventStart, 14),
  },
  {
    name: 'Fourth Sunday of Advent',
    kind: 'commemoration',
    date: (year) => shift(year.adventStart, 21),
  },
  {
    name: 'Ash Wednesday',
    kind: 'commemoration',
    note: 'Lent begins. Fast and abstinence.',
    date: (year) => year.ashWednesday,
  },
  {
    name: 'Palm Sunday',
    kind: 'commemoration',
    note: 'The Lord enters Jerusalem in the Passion.',
    date: (year) => year.palmSunday,
  },
  {
    name: 'Holy Thursday',
    kind: 'commemoration',
    note: "The Lord's Supper.",
    date: (year) => year.holyThursday,
  },
  {
    name: 'Good Friday',
    kind: 'commemoration',
    note: 'The Passion and death of the Lord.',
    date: (year) => year.goodFriday,
  },
  {
    name: 'Holy Saturday',
    kind: 'commemoration',
    note: 'The Lord lies in the tomb.',
    date: (year) => year.holySaturday,
  },
  {
    name: 'Easter Sunday',
    kind: 'solemnity',
    note: 'The Resurrection of the Lord.',
    date: (year) => year.easter,
  },
  {
    name: 'Solemnity of the Ascension of the Lord',
    kind: 'solemnity',
    date: (year) => year.ascension,
  },
  {
    name: 'Solemnity of Pentecost',
    kind: 'solemnity',
    note: 'The Holy Spirit comes upon the Church.',
    date: (year) => year.pentecost,
  },
  {
    name: 'Solemnity of the Most Holy Trinity',
    kind: 'solemnity',
    date: (year) => year.trinitySunday,
  },
  {
    name: 'Solemnity of the Most Holy Body and Blood of Christ',
    kind: 'solemnity',
    date: (year) => year.corpusChristi,
  },
  {
    name: 'Solemnity of the Most Sacred Heart of Jesus',
    kind: 'solemnity',
    date: (year) => shift(year.corpusChristi, 6),
  },
  {
    name: 'Solemnity of Christ the King',
    kind: 'solemnity',
    date: (year) => year.christTheKing,
  },
];

/** Moveable commemorations that fall on a given date. */
export function moveableFeastsFor(date: Date): Commemoration[] {
  const year = liturgicalYear(date.getUTCFullYear());
  return MOVEABLE_FEASTS.filter((feast) => isSameDay(feast.date(year), date)).map(
    (feast) => ({
      name: feast.name,
      kind: feast.kind,
      ...(feast.note ? { note: feast.note } : {}),
    }),
  );
}
