import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { currentNovenas } from '../src/today.js';
import { utcDate } from '../src/calendar/dates.js';

/**
 * The novenas that are being made today.
 *
 * Each one is begun on its own day and said for nine days, so the home page
 * can show what is being prayed at this time of the year.
 */

const titles = (year: number, month: number, day: number) =>
  currentNovenas(utcDate(year, month, day)).map((novena) => novena.title);

describe('the novenas being made today', () => {
  it('shows St. Joseph’s novena from the fifteenth of March', () => {
    assert.deepEqual(titles(2026, 3, 15), ['Novena to St. Joseph']);
    assert.deepEqual(titles(2026, 3, 14), []);
    // By the twenty-third St. Patrick's has begun as well, so both are shown.
    assert.deepEqual(titles(2026, 3, 23), [
      'Novena to St. Joseph',
      'Novena to St. Patrick',
    ]);
  });

  it('counts the day of the novena', () => {
    const [novena] = currentNovenas(utcDate(2026, 3, 17));
    assert.equal(novena?.day, 3);
    assert.equal(novena?.duration, 9);
    assert.equal(novena?.href, '/novenas/st-joseph');
  });

  it('shows two novenas when two overlap', () => {
    // St. Joseph's is begun on the fifteenth of March, and St. Patrick's on
    // the seventeenth, so they overlap for a week.
    const both = titles(2026, 3, 18);
    assert.deepEqual(both, [
      'Novena to St. Joseph',
      'Novena to St. Patrick',
    ]);
  });

  it('shows the novena to the Holy Spirit from Pentecost', () => {
    // Pentecost 2026 is the twenty-fourth of May.
    assert.deepEqual(titles(2026, 5, 24), ['Novena to the Holy Spirit']);
    assert.deepEqual(titles(2026, 5, 23), []);
  });

  it('shows nothing when no novena is being made', () => {
    assert.deepEqual(titles(2026, 11, 9), []);
  });
});
