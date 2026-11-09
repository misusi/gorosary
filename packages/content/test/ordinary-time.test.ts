import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { describeDay } from '../src/calendar/day.js';
import { addDays, utcDate } from '../src/calendar/dates.js';
import { availableReadingYears, yearEntries } from '../src/readings.js';

/**
 * The week of Ordinary Time, as the Roman Lectionary numbers it.
 *
 * The lectionary content is extracted from the liturgical calendars the
 * United States Conference of Catholic Bishops publishes, and it names the
 * week for every Sunday — "Second Sunday In Ordinary Time" — and for a few
 * weekdays. The calendar engine works the week out from the computus
 * instead, and the two must agree: a prayer app that says the readings are
 * for the ninth week on a page that calls it the eleventh is contradicting
 * itself in front of the person praying.
 */

const ORDINALS = [
  'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh',
  'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth',
  'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth',
  'nineteenth', 'twentieth', 'twenty-first', 'twenty-second',
  'twenty-third', 'twenty-fourth', 'twenty-fifth', 'twenty-sixth',
  'twenty-seventh', 'twenty-eighth', 'twenty-ninth', 'thirtieth',
  'thirty-first', 'thirty-second', 'thirty-third', 'thirty-fourth',
];

const WEEK_NUMBERS = new Map(
  ORDINALS.map((word, index) => [word.replace(/-/g, ''), index + 1]),
);

/** The week number a name such as "Thirty-Second" stands for. */
function numberOf(word: string): number | null {
  return WEEK_NUMBERS.get(word.toLowerCase().replace(/-/g, '')) ?? null;
}

/** The week the lectionary names for a day, if it names one. */
function lectionaryWeek(celebration: string): number | null {
  const sunday = celebration.match(/^(.+?) Sunday In Ordinary Time$/);
  if (sunday) return numberOf(sunday[1]!);

  const weekday = celebration.match(/\((.+?) Week in Ordinary Time\)/);
  if (weekday) return numberOf(weekday[1]!);

  return null;
}

/** The week the calendar engine names for a day, if it names one. */
function engineWeek(label: string): number | null {
  const match = label.match(
    /^the (.+?) (?:Sunday|Week) (?:of|in) Ordinary Time$/,
  );
  return match ? numberOf(match[1]!) : null;
}

/**
 * The Sunday that opens the week a day falls in.
 *
 * The weeks run from Sunday to Saturday, so a Sunday opens its own week and
 * every other day belongs to the week of the Sunday before it.
 */
function weekOpeningSunday(date: Date): Date {
  if (date.getUTCDay() === 0) return date;
  const day = addDays(date, -1);
  return addDays(day, -day.getUTCDay());
}

describe('the week of Ordinary Time', () => {
  for (const year of availableReadingYears()) {
    it(`agrees with the lectionary in ${year}`, () => {
      const mismatches: string[] = [];
      let checked = 0;

      for (const entry of yearEntries(year)) {
        const expected = lectionaryWeek(entry.celebration ?? '');
        if (expected === null) continue;

        const [y, m, d] = entry.date.split('-').map(Number) as [
          number,
          number,
          number,
        ];
        const label = describeDay(utcDate(y, m, d)).weekLabel;
        const actual = engineWeek(label);

        checked += 1;

        if (actual !== expected) {
          mismatches.push(
            `${entry.date} "${entry.celebration}" → "${label}" ` +
              `(expected week ${expected}, got ${actual ?? 'none'})`,
          );
        }
      }

      assert.ok(checked >= 25, `expected the lectionary to cover ${year}`);
      assert.deepEqual(
        mismatches,
        [],
        `the engine and the lectionary disagree in ${year}:\n${mismatches.join('\n')}`,
      );
    });

    it(`gives every day of Ordinary Time the week of its Sunday in ${year}`, () => {
      const blocks = new Map<string, Set<number>>();
      const order: number[] = [];

      for (let day = 0; day < 366; day += 1) {
        const date = addDays(utcDate(year, 1, 1), day);
        if (date.getUTCFullYear() !== year) break;

        const description = describeDay(date);
        if (description.season !== 'ordinary') continue;

        const week = engineWeek(description.weekLabel);
        assert.ok(
          week !== null,
          `${date.toISOString().slice(0, 10)} has no week: "${description.weekLabel}"`,
        );

        const opening = weekOpeningSunday(date).toISOString().slice(0, 10);
        const seen = blocks.get(opening) ?? new Set<number>();
        seen.add(week!);
        blocks.set(opening, seen);

        if (order[order.length - 1] !== week) order.push(week!);
      }

      const split = [...blocks].filter(([, weeks]) => weeks.size > 1);
      assert.deepEqual(
        split.map(([sunday, weeks]) => `${sunday}: ${[...weeks].join(', ')}`),
        [],
        'a week has more than one number',
      );

      assert.ok(order.length > 30, `expected Ordinary Time in ${year}`);
      assert.ok(
        order.every((week) => week >= 1 && week <= 34),
        `a week fell outside 1 to 34 in ${year}: ${order.join(', ')}`,
      );
      assert.deepEqual(
        order,
        [...order].sort((a, b) => a - b),
        `the weeks of Ordinary Time do not run in order in ${year}`,
      );
    });
  }

  it('numbers the weeks the way the lectionary does', () => {
    // The week of the Baptism of the Lord is the first, and the Sunday that
    // follows it opens the second.
    assert.equal(
      describeDay(utcDate(2026, 1, 19)).weekLabel,
      'the Second Week of Ordinary Time',
    );
    assert.equal(
      describeDay(utcDate(2026, 1, 18)).weekLabel,
      'the Second Sunday in Ordinary Time',
    );

    // The second run of Ordinary Time is numbered back from the end, so that
    // the week of Christ the King is the thirty-fourth.
    assert.equal(
      describeDay(utcDate(2026, 6, 1)).weekLabel,
      'the Ninth Week of Ordinary Time',
    );
    assert.equal(
      describeDay(utcDate(2026, 11, 8)).weekLabel,
      'the Thirty-Second Sunday in Ordinary Time',
    );
    assert.equal(
      describeDay(utcDate(2026, 11, 15)).weekLabel,
      'the Thirty-Third Sunday in Ordinary Time',
    );
  });
});
