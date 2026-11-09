import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  cycleYearFor,
  holyFamilyDate,
  lectionaryPosition,
  liturgicalStartYear,
} from '../src/calendar/lectionary.js';
import { liturgicalYear } from '../src/calendar/liturgical.js';
import { utcDate } from '../src/calendar/dates.js';

/**
 * The lectionary engine decides which Scripture is read on which day.
 * Getting it wrong would show the wrong reading, so it is pinned here.
 */

describe('the three-year cycle', () => {
  it('begins a new cycle year at Advent', () => {
    // The Advent that opened 2022 was Year A. This is what the USCCB
    // liturgical calendars state: "Sunday Cycle YEAR A — November 30, 2025
    // to November 22, 2026", and so on for each year.
    assert.equal(cycleYearFor(utcDate(2022, 11, 27)), 'a');
    assert.equal(cycleYearFor(utcDate(2023, 12, 3)), 'b');
    assert.equal(cycleYearFor(utcDate(2024, 12, 1)), 'c');
    assert.equal(cycleYearFor(utcDate(2025, 11, 30)), 'a');
    assert.equal(cycleYearFor(utcDate(2026, 11, 29)), 'b');
    assert.equal(cycleYearFor(utcDate(2027, 11, 28)), 'c');
    assert.equal(cycleYearFor(utcDate(2028, 12, 3)), 'a');
  });

  it('keeps the same cycle year through the whole liturgical year', () => {
    // Before Advent, the year still belongs to the previous Advent.
    assert.equal(cycleYearFor(utcDate(2026, 6, 1)), 'a');
    assert.equal(cycleYearFor(utcDate(2026, 11, 28)), 'a');
    // From Advent, the new cycle year starts.
    assert.equal(cycleYearFor(utcDate(2026, 11, 29)), 'b');
    assert.equal(cycleYearFor(utcDate(2027, 6, 1)), 'b');
  });

  it('finds the year whose Advent opened the liturgical year', () => {
    // Advent 2026 began on 29 November, so December belongs to the new year.
    assert.equal(liturgicalStartYear(utcDate(2026, 12, 1)), 2026);
    assert.equal(liturgicalStartYear(utcDate(2026, 11, 29)), 2026);
    // A date before that Sunday still belongs to the previous year.
    assert.equal(liturgicalStartYear(utcDate(2026, 11, 28)), 2025);
    assert.equal(liturgicalStartYear(utcDate(2026, 1, 1)), 2025);
  });
});

describe('the lectionary slot', () => {
  const slotAt = (year: number, month: number, day: number) =>
    lectionaryPosition(utcDate(year, month, day)).slot;

  it('numbers the weeks of Advent', () => {
    assert.equal(slotAt(2026, 11, 29), 'advent:1:0');
    assert.equal(slotAt(2026, 12, 6), 'advent:2:0');
    assert.equal(slotAt(2026, 12, 13), 'advent:3:0');
    assert.equal(slotAt(2026, 12, 20), 'advent:4:0');
  });

  it('gives the solemnities their own slots', () => {
    assert.equal(slotAt(2026, 12, 25), 'named:christmas');
    assert.equal(slotAt(2027, 1, 1), 'named:mary-mother-of-god');
    assert.equal(slotAt(2027, 1, 6), 'named:epiphany');
    assert.equal(slotAt(2027, 1, 10), 'named:baptism-of-the-lord');
    assert.equal(slotAt(2027, 2, 10), 'named:ash-wednesday');
    assert.equal(slotAt(2027, 3, 21), 'named:palm-sunday');
    assert.equal(slotAt(2027, 3, 25), 'named:holy-thursday');
    assert.equal(slotAt(2027, 3, 26), 'named:good-friday');
    assert.equal(slotAt(2027, 3, 27), 'named:holy-saturday');
    assert.equal(slotAt(2027, 3, 28), 'named:easter');
    assert.equal(slotAt(2027, 5, 6), 'named:ascension');
    assert.equal(slotAt(2027, 5, 16), 'named:pentecost');
    assert.equal(slotAt(2027, 5, 23), 'named:trinity');
    assert.equal(slotAt(2027, 5, 27), 'named:corpus-christi');
    assert.equal(slotAt(2027, 8, 15), 'named:assumption');
    assert.equal(slotAt(2027, 11, 1), 'named:all-saints');
    assert.equal(slotAt(2027, 11, 21), 'named:christ-the-king');
  });

  it('numbers the weeks of Lent and Ordinary Time', () => {
    assert.equal(slotAt(2027, 2, 14), 'lent:1:0');
    assert.equal(slotAt(2027, 3, 7), 'lent:4:0');
    assert.equal(slotAt(2027, 1, 17), 'ordinary:2:0');
    assert.equal(slotAt(2026, 11, 8), 'ordinary:32:0');
  });

  it('gives each weekday of a week its own slot', () => {
    // 9 November 2026 is the Monday of the thirty-second week of Ordinary Time.
    assert.equal(slotAt(2026, 11, 9), 'ordinary:32:1');
    assert.equal(slotAt(2026, 11, 10), 'ordinary:32:2');
    assert.equal(slotAt(2026, 11, 14), 'ordinary:32:6');
  });

  it('keeps the Holy Family on the Sunday within the Octave', () => {
    // 27 December 2026 is a Sunday inside the Octave of Christmas.
    assert.equal(slotAt(2026, 12, 27), 'named:holy-family');
    // 28 December 2025 is a Sunday inside the Octave.
    assert.equal(slotAt(2025, 12, 28), 'named:holy-family');
    // 26 December 2027 is a Sunday inside the Octave.
    assert.equal(slotAt(2027, 12, 26), 'named:holy-family');
  });

  it('moves the Holy Family when the Octave has no Sunday in it', () => {
    // In 2023 the Octave of Christmas had no Sunday, so the feast moved to
    // the Sunday after the Baptism of the Lord.
    const year = liturgicalYear(2023);
    const holyFamily = holyFamilyDate(year);
    assert.equal(holyFamily.getUTCDay(), 0);
    assert.ok(holyFamily > year.baptismOfTheLord);
    assert.equal(
      lectionaryPosition(holyFamily).slot,
      'named:holy-family',
    );
  });
});
