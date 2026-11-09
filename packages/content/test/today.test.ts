import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

// The day is the user's day, so the tests run in a known timezone rather
// than the one the machine happens to be in.
process.env.TZ = 'America/New_York';

import { getTodayRosary } from '../src/today.js';

/**
 * "Today" has to mean the user's today.
 *
 * A phone in New York at half past nine in the evening is already past
 * midnight in UTC. If the engine reads the day in UTC, the calendar panel
 * describes tomorrow while the rest of the page describes today — and the
 * fasts, the vigils and the colour with it.
 */

describe("today's day", () => {
  it('describes the user’s day, not the day it has reached in UTC', () => {
    // 02:30 UTC on Monday 9 November is still Sunday 8 November in New York.
    const instant = new Date('2026-11-09T02:30:00Z');

    const today = getTodayRosary(instant);

    assert.equal(today.iso, '2026-11-08');
    assert.equal(today.weekday, 'Sunday');
    assert.equal(today.day.date.toISOString().slice(0, 10), '2026-11-08');
    assert.equal(
      today.day.weekLabel,
      'the Thirty-Second Sunday in Ordinary Time',
    );
  });

  it('describes the same day for the whole of it', () => {
    // Every hour of Sunday 8 November in New York, from first light to
    // midnight, is still Sunday.
    for (let hour = 0; hour < 24; hour += 1) {
      const instant = new Date(
        `2026-11-08T${String(hour).padStart(2, '0')}:30:00-05:00`,
      );
      const today = getTodayRosary(instant);

      assert.equal(today.iso, '2026-11-08', `hour ${hour}`);
      assert.equal(
        today.day.date.toISOString().slice(0, 10),
        '2026-11-08',
        `hour ${hour}`,
      );
    }
  });

  it('moves on at midnight, in the user’s timezone', () => {
    const instant = new Date('2026-11-09T00:30:00-05:00');

    const today = getTodayRosary(instant);

    assert.equal(today.iso, '2026-11-09');
    assert.equal(today.weekday, 'Monday');
    assert.equal(
      today.day.weekLabel,
      'the Thirty-Second Week of Ordinary Time',
    );
  });
});
