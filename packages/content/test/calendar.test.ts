import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  adventStart,
  baptismOfTheLord,
  easterDate,
  liturgicalYear,
  seasonFor,
} from '../src/calendar/liturgical.js';
import { resolveMysteries } from '../src/calendar/rules.js';
import { monthDayKey, utcDate } from '../src/calendar/dates.js';

/**
 * The calendar engine is the one part of GoRosary that has to be right without
 * a human checking it. Every date below is a known date from the Roman
 * liturgical calendar.
 */

describe('Easter', () => {
  const known: [number, string][] = [
    [2021, '2021-04-04'],
    [2022, '2022-04-17'],
    [2023, '2023-04-09'],
    [2024, '2024-03-31'],
    [2025, '2025-04-20'],
    [2026, '2026-04-05'],
    [2027, '2027-03-28'],
    [2028, '2028-04-16'],
    [2030, '2030-04-21'],
  ];

  for (const [year, expected] of known) {
    it(`falls on ${expected}`, () => {
      assert.equal(easterDate(year).toISOString().slice(0, 10), expected);
    });
  }
});

describe('Advent', () => {
  const known: [number, string][] = [
    [2021, '2021-11-28'],
    [2022, '2022-11-27'],
    [2023, '2023-12-03'],
    [2024, '2024-12-01'],
    [2025, '2025-11-30'],
  ];

  for (const [year, expected] of known) {
    it(`begins on ${expected}`, () => {
      assert.equal(adventStart(year).toISOString().slice(0, 10), expected);
    });
  }

  it('always begins on a Sunday', () => {
    for (let year = 2000; year < 2060; year += 1) {
      assert.equal(adventStart(year).getUTCDay(), 0, `year ${year}`);
    }
  });
});

describe('the Baptism of the Lord', () => {
  const known: [number, string][] = [
    [2023, '2023-01-08'],
    [2024, '2024-01-07'],
    [2025, '2025-01-12'],
    [2026, '2026-01-11'],
  ];

  for (const [year, expected] of known) {
    it(`falls on ${expected}`, () => {
      assert.equal(
        baptismOfTheLord(year).toISOString().slice(0, 10),
        expected,
      );
    });
  }

  it('always falls between 7 and 13 January', () => {
    for (let year = 2000; year < 2060; year += 1) {
      const day = baptismOfTheLord(year).getUTCDate();
      assert.ok(day >= 7 && day <= 13, `year ${year} gave ${day}`);
    }
  });
});

describe('the seasons', () => {
  it('opens Advent on the first Sunday of Advent', () => {
    assert.equal(seasonFor(utcDate(2025, 11, 30)), 'advent');
    assert.equal(seasonFor(utcDate(2025, 11, 29)), 'ordinary');
  });

  it('runs Christmas from 25 December to the Baptism of the Lord', () => {
    assert.equal(seasonFor(utcDate(2025, 12, 25)), 'christmas');
    assert.equal(seasonFor(utcDate(2026, 1, 2)), 'christmas');
    assert.equal(seasonFor(utcDate(2026, 1, 11)), 'christmas');
    assert.equal(seasonFor(utcDate(2026, 1, 12)), 'ordinary');
    assert.equal(seasonFor(utcDate(2026, 2, 1)), 'ordinary');
  });

  it('runs Lent from Ash Wednesday to Palm Sunday', () => {
    assert.equal(seasonFor(utcDate(2025, 3, 4)), 'ordinary');
    assert.equal(seasonFor(utcDate(2025, 3, 5)), 'lent');
    assert.equal(seasonFor(utcDate(2025, 4, 13)), 'holy-week');
    assert.equal(seasonFor(utcDate(2025, 4, 20)), 'easter');
  });

  it('ends the Easter season at Pentecost', () => {
    assert.equal(seasonFor(utcDate(2025, 6, 8)), 'easter');
    assert.equal(seasonFor(utcDate(2025, 6, 9)), 'ordinary');
  });
});

describe('the movable feasts of the liturgical year', () => {
  const year = liturgicalYear(2025);

  it('derives Ash Wednesday from Easter', () => {
    assert.equal(year.ashWednesday.toISOString().slice(0, 10), '2025-03-05');
  });

  it('derives Pentecost, Trinity and Corpus Christi', () => {
    assert.equal(year.pentecost.toISOString().slice(0, 10), '2025-06-08');
    assert.equal(year.trinitySunday.toISOString().slice(0, 10), '2025-06-15');
    assert.equal(year.corpusChristi.toISOString().slice(0, 10), '2025-06-19');
  });

  it('puts Christ the King on the last Sunday before Advent', () => {
    assert.equal(year.christTheKing.toISOString().slice(0, 10), '2025-11-23');
  });
});

describe("today's mysteries", () => {
  it('gives the Sorrowful Mysteries on Our Lady of Sorrows', () => {
    const resolution = resolveMysteries(utcDate(2025, 9, 15));
    assert.equal(resolution.set, 'sorrowful');
    assert.match(resolution.reason, /Our Lady of Sorrows/);
  });

  it('gives the Joyful Mysteries on the Feast of Our Lady of the Rosary', () => {
    const resolution = resolveMysteries(utcDate(2025, 10, 7));
    assert.equal(resolution.set, 'joyful');
    assert.match(resolution.reason, /Our Lady of the Rosary/);
  });

  it('gives the Joyful Mysteries on the Assumption', () => {
    assert.equal(resolveMysteries(utcDate(2025, 8, 15)).set, 'joyful');
  });

  it('gives the Joyful Mysteries on the Immaculate Conception', () => {
    assert.equal(resolveMysteries(utcDate(2025, 12, 8)).set, 'joyful');
  });

  it('follows Lent with the Sorrowful Mysteries', () => {
    assert.equal(resolveMysteries(utcDate(2025, 3, 12)).set, 'sorrowful');
  });

  it('follows the Easter season with the Glorious Mysteries', () => {
    assert.equal(resolveMysteries(utcDate(2025, 4, 23)).set, 'glorious');
  });

  it('gives the Sorrowful Mysteries on Corpus Christi', () => {
    const resolution = resolveMysteries(utcDate(2025, 6, 19));
    assert.equal(resolution.set, 'sorrowful');
    assert.match(resolution.reason, /Body and Blood of Christ/);
  });

  it('replaces the Rosary on All Souls’ Day', () => {
    const resolution = resolveMysteries(utcDate(2025, 11, 2));
    assert.match(resolution.reason, /All Souls/);
  });

  it('always offers the weekly cycle as the alternative', () => {
    // 2025-09-15 is a Monday, so the weekly cycle also says Joyful.
    const resolution = resolveMysteries(utcDate(2025, 9, 15));
    assert.equal(resolution.alternative.set, 'joyful');
    assert.match(resolution.alternative.reason, /Mondays/);
  });

  it('names the weekday correctly', () => {
    assert.equal(resolveMysteries(utcDate(2025, 9, 15)).weekday, 'Monday');
    assert.equal(resolveMysteries(utcDate(2025, 11, 2)).weekday, 'Sunday');
  });

  describe('the hybrid rule', () => {
    it('lets the season decide in Advent, even on a Sunday', () => {
      // 30 November 2025 is the First Sunday of Advent. The weekly cycle
      // would say Glorious; Advent says Joyful.
      const resolution = resolveMysteries(utcDate(2025, 11, 30));
      assert.equal(resolution.set, 'joyful');
      assert.equal(resolution.source, 'season');
      assert.equal(resolution.alternative.set, 'glorious');
    });

    it('lets the season decide in the Christmas season, even on a Tuesday', () => {
      // 30 December 2025 is a Tuesday. The weekly cycle would say Sorrowful.
      const resolution = resolveMysteries(utcDate(2025, 12, 30));
      assert.equal(resolution.set, 'joyful');
      assert.equal(resolution.source, 'season');
    });

    it('lets the season decide in Lent, even on a Sunday', () => {
      // 9 March 2025 is a Sunday in Lent. The weekly cycle would say Glorious.
      const resolution = resolveMysteries(utcDate(2025, 3, 9));
      assert.equal(resolution.set, 'sorrowful');
      assert.equal(resolution.source, 'season');
    });

    it('lets the season decide at Easter, even on a Monday', () => {
      // 21 April 2025 is Easter Monday. The weekly cycle would say Joyful.
      const resolution = resolveMysteries(utcDate(2025, 4, 21));
      assert.equal(resolution.set, 'glorious');
      assert.equal(resolution.source, 'season');
    });

    it('lets the week decide in Ordinary Time', () => {
      // 15 October 2025 is a Wednesday in Ordinary Time.
      assert.equal(resolveMysteries(utcDate(2025, 10, 15)).set, 'glorious');
      assert.equal(resolveMysteries(utcDate(2025, 10, 15)).source, 'week');
      // 13 October 2025 is a Monday, 14 October a Tuesday.
      assert.equal(resolveMysteries(utcDate(2025, 10, 13)).set, 'joyful');
      assert.equal(resolveMysteries(utcDate(2025, 10, 14)).set, 'sorrowful');
    });

    it('offers the other tradition alongside, always', () => {
      const inOrdinaryTime = resolveMysteries(utcDate(2025, 10, 15));
      assert.match(inOrdinaryTime.alternative.reason, /Ordinary Time/);

      const inLent = resolveMysteries(utcDate(2025, 3, 9));
      assert.match(inLent.alternative.reason, /Sundays traditionally/);
    });
  });
});

describe('date helpers', () => {
  it('formats a fixed-date key', () => {
    assert.equal(monthDayKey(utcDate(2025, 9, 5)), '09-05');
    assert.equal(monthDayKey(utcDate(2025, 12, 25)), '12-25');
  });
});
