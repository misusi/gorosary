import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { describeDay } from '../src/calendar/day.js';
import { utcDate } from '../src/calendar/dates.js';
import type { Commemoration } from '../src/calendar/feasts.js';

/**
 * The home page tells a person where they are in the Church's year. These
 * tests pin the week numbering, the fasts, and the liturgical colour.
 */

describe('where we are in the liturgical year', () => {
  it('numbers Ordinary Time the way the lectionary does', () => {
    // 8 November 2026. The second run of Ordinary Time is numbered back from
    // the week of Christ the King, which is the thirty-fourth, so this
    // Sunday is the thirty-second. The Roman Lectionary calls it the same.
    const day = describeDay(utcDate(2026, 11, 8));
    assert.equal(day.season, 'ordinary');
    assert.equal(day.weekLabel, 'the Thirty-Second Sunday in Ordinary Time');
  });

  it('starts Ordinary Time again at the Baptism of the Lord', () => {
    // 11 January 2026 is the Baptism of the Lord, and it opens the first
    // week of Ordinary Time; the Sunday after it is the second.
    const day = describeDay(utcDate(2026, 1, 18));
    assert.equal(day.weekLabel, 'the Second Sunday in Ordinary Time');
  });

  it('counts the Sundays of Advent', () => {
    assert.equal(
      describeDay(utcDate(2026, 11, 29)).weekLabel,
      'the First Sunday of Advent',
    );
    assert.equal(
      describeDay(utcDate(2026, 12, 6)).weekLabel,
      'the Second Sunday of Advent',
    );
    assert.equal(
      describeDay(utcDate(2026, 12, 20)).weekLabel,
      'the Fourth Sunday of Advent',
    );
  });

  it('names the days of Christmas', () => {
    assert.equal(describeDay(utcDate(2026, 12, 25)).weekLabel, 'Christmas Day');
    assert.equal(
      describeDay(utcDate(2026, 12, 26)).weekLabel,
      'the Second Day of Christmas',
    );
    assert.equal(
      describeDay(utcDate(2026, 12, 31)).weekLabel,
      'the Seventh Day of Christmas',
    );
    assert.equal(
      describeDay(utcDate(2026, 1, 1)).weekLabel,
      'the Octave Day of Christmas',
    );
  });

  it('counts the weeks and Sundays of Lent', () => {
    assert.equal(
      describeDay(utcDate(2026, 2, 18)).weekLabel,
      'the First Week of Lent',
    );
    assert.equal(
      describeDay(utcDate(2026, 2, 22)).weekLabel,
      'the First Sunday of Lent',
    );
    assert.equal(
      describeDay(utcDate(2026, 3, 15)).weekLabel,
      'the Fourth Sunday of Lent',
    );
  });

  it('names the days of Holy Week', () => {
    assert.equal(describeDay(utcDate(2026, 3, 29)).weekLabel, 'Palm Sunday');
    assert.equal(describeDay(utcDate(2026, 4, 2)).weekLabel, 'Holy Thursday');
    assert.equal(describeDay(utcDate(2026, 4, 3)).weekLabel, 'Good Friday');
    assert.equal(describeDay(utcDate(2026, 4, 4)).weekLabel, 'Holy Saturday');
  });

  it('counts the Sundays of Easter', () => {
    assert.equal(describeDay(utcDate(2026, 4, 5)).weekLabel, 'Easter Sunday');
    assert.equal(
      describeDay(utcDate(2026, 4, 6)).weekLabel,
      'the Second Day of Easter',
    );
    assert.equal(
      describeDay(utcDate(2026, 4, 12)).weekLabel,
      'the Second Sunday of Easter',
    );
    assert.equal(describeDay(utcDate(2026, 5, 24)).weekLabel, 'Pentecost');
  });
});

describe('the liturgical colour', () => {
  /** The colours of a day, as a list of names. */
  const colours = (
    year: number,
    month: number,
    day: number,
    kept?: Commemoration[],
  ) => describeDay(utcDate(year, month, day), kept).colours.map((c) => c.colour);

  it('is green in Ordinary Time', () => {
    assert.deepEqual(colours(2026, 11, 8), ['green']);
  });

  it('is violet in Advent and Lent', () => {
    assert.deepEqual(colours(2026, 11, 29), ['violet']);
    assert.deepEqual(colours(2026, 2, 22), ['violet']);
  });

  it('is white at Christmas and Easter', () => {
    assert.deepEqual(colours(2026, 12, 25), ['white']);
    assert.deepEqual(colours(2026, 4, 5), ['white']);
  });

  it('is red for the Passion and for Pentecost', () => {
    assert.deepEqual(colours(2026, 3, 29), ['red']);
    assert.deepEqual(colours(2026, 4, 3), ['red']);
    assert.deepEqual(colours(2026, 5, 24), ['red']);
  });

  it('is white for the Mass of the Lord’s Supper', () => {
    assert.deepEqual(colours(2026, 4, 2), ['white']);
  });

  it('is black on All Souls’ Day', () => {
    assert.deepEqual(colours(2026, 11, 2), ['black', 'green']);
  });

  it('shows the celebration’s colour above the colour of the weekday', () => {
    // 17 November 2026 is an ordinary Tuesday in Ordinary Time, and St.
    // Anthony Abbot's memorial is kept on it: the day is white, and the
    // weekday it falls on is green.
    const kept = [
      {
        name: 'St. Anthony, Abbot',
        kind: 'memorial' as const,
      },
    ];
    assert.deepEqual(colours(2026, 11, 17, kept), ['white', 'green']);
  });

  it('shows a martyr’s memorial in red above the colour of the weekday', () => {
    const kept = [
      {
        name: 'St. Agnes, Virgin and Martyr',
        kind: 'memorial' as const,
      },
    ];
    assert.deepEqual(colours(2026, 1, 21, kept), ['red', 'green']);
  });

  it('gives a feast its own colour above the colour of the weekday', () => {
    // 9 November 2026 is the Dedication of the Lateran Basilica, a feast in
    // Ordinary Time: the day is white, and the weekday it falls on is green.
    const kept = [
      {
        name: 'Dedication of the Lateran Basilica',
        kind: 'feast' as const,
        note: 'The cathedral of Rome.',
      },
    ];
    assert.deepEqual(colours(2026, 11, 9, kept), ['white', 'green']);
  });

  it('shows only one colour when the two agree', () => {
    // A feast of the Lord at Christmas is white, and Christmas is white too.
    const kept = [
      {
        name: 'The Nativity of the Lord',
        kind: 'solemnity' as const,
      },
    ];
    assert.deepEqual(colours(2026, 12, 25, kept), ['white']);
  });

  it('shows a martyr’s feast in red', () => {
    const kept = [
      {
        name: 'St. Lawrence, Deacon and Martyr',
        kind: 'feast' as const,
      },
    ];
    assert.deepEqual(colours(2026, 8, 10, kept), ['red', 'green']);
  });

  it('leaves the weekday’s colour alone for an optional memorial', () => {
    // An optional memorial is only mentioned; the weekday is kept.
    const kept = [
      {
        name: 'St. Elizabeth Ann Seton, Religious',
        kind: 'optional-memorial' as const,
      },
    ];
    assert.deepEqual(colours(2026, 11, 10, kept), ['green']);
  });

  it('does not give an ordinary memorial the day in Lent', () => {
    const kept = [
      {
        name: 'St. Lucy, Virgin and Martyr',
        kind: 'memorial' as const,
      },
    ];
    assert.deepEqual(colours(2026, 12, 13, kept), ['violet']);
  });
});

describe('fasts', () => {
  it('keeps the fast of Ash Wednesday', () => {
    const day = describeDay(utcDate(2026, 2, 18));
    assert.ok(day.fasts.some((fast) => fast.name === 'Ash Wednesday'));
  });

  it('keeps the fast of every Friday in Lent', () => {
    const day = describeDay(utcDate(2026, 2, 20));
    assert.ok(day.fasts.some((fast) => fast.name === 'Friday in Lent'));
  });

  it('keeps the fast of every Friday in Advent', () => {
    const day = describeDay(utcDate(2026, 12, 18));
    assert.ok(day.fasts.some((fast) => fast.name === 'Friday in Advent'));
  });

  it('keeps the fast of Christmas Eve and All Souls’ Day', () => {
    assert.ok(
      describeDay(utcDate(2026, 12, 24)).fasts.some(
        (fast) => fast.name === 'Christmas Eve',
      ),
    );
    assert.ok(
      describeDay(utcDate(2026, 11, 2)).fasts.some(
        (fast) => fast.name === "All Souls' Day",
      ),
    );
  });

  it('has no fast on an ordinary day', () => {
    assert.deepEqual(describeDay(utcDate(2026, 11, 8)).fasts, []);
  });
});

describe('vigils', () => {
  it('knows the four vigils', () => {
    assert.ok(
      describeDay(utcDate(2026, 12, 24)).vigils.some(
        (vigil) => vigil.name === 'The Vigil of Christmas',
      ),
    );
    assert.ok(
      describeDay(utcDate(2026, 10, 31)).vigils.some(
        (vigil) => vigil.name === 'The Vigil of All Saints',
      ),
    );
    assert.ok(
      describeDay(utcDate(2026, 4, 4)).vigils.some(
        (vigil) => vigil.name === 'The Easter Vigil',
      ),
    );
    assert.ok(
      describeDay(utcDate(2026, 5, 23)).vigils.some(
        (vigil) => vigil.name === 'The Vigil of Pentecost',
      ),
    );
  });

  it('has no vigil on an ordinary day', () => {
    assert.deepEqual(describeDay(utcDate(2026, 11, 8)).vigils, []);
  });
});

describe('moveable commemorations', () => {
  it('names the first Sunday of Advent', () => {
    const day = describeDay(utcDate(2026, 11, 29));
    assert.ok(
      day.commemorations.some(
        (entry) => entry.name === 'First Sunday of Advent',
      ),
    );
  });

  it('names Easter Sunday', () => {
    const day = describeDay(utcDate(2026, 4, 5));
    assert.ok(
      day.commemorations.some((entry) => entry.name === 'Easter Sunday'),
    );
  });
});
