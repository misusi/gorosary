import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { describeDay } from '../src/calendar/day.js';
import { utcDate } from '../src/calendar/dates.js';

/**
 * The home page tells a person where they are in the Church's year. These
 * tests pin the week numbering, the fasts, and the liturgical colour.
 */

describe('where we are in the liturgical year', () => {
  it('numbers Ordinary Time across the whole year, not per half', () => {
    // 8 November 2026. The first stretch of Ordinary Time ran to the fifth
    // week, so this Sunday in the second stretch is the twenty-ninth.
    const day = describeDay(utcDate(2026, 11, 8));
    assert.equal(day.season, 'ordinary');
    assert.equal(day.weekLabel, 'the Twenty-Ninth Sunday in Ordinary Time');
  });

  it('starts Ordinary Time again at the Baptism of the Lord', () => {
    // 18 January 2026 is the first Sunday of Ordinary Time.
    const day = describeDay(utcDate(2026, 1, 18));
    assert.equal(day.weekLabel, 'the First Sunday in Ordinary Time');
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
  it('is green in Ordinary Time', () => {
    assert.equal(describeDay(utcDate(2026, 11, 8)).colour, 'green');
  });

  it('is violet in Advent and Lent', () => {
    assert.equal(describeDay(utcDate(2026, 11, 29)).colour, 'violet');
    assert.equal(describeDay(utcDate(2026, 2, 22)).colour, 'violet');
  });

  it('is white at Christmas and Easter', () => {
    assert.equal(describeDay(utcDate(2026, 12, 25)).colour, 'white');
    assert.equal(describeDay(utcDate(2026, 4, 5)).colour, 'white');
  });

  it('is red for the Passion and for Pentecost', () => {
    assert.equal(describeDay(utcDate(2026, 3, 29)).colour, 'red');
    assert.equal(describeDay(utcDate(2026, 4, 3)).colour, 'red');
    assert.equal(describeDay(utcDate(2026, 5, 24)).colour, 'red');
  });

  it('is white for the Mass of the Lord’s Supper', () => {
    assert.equal(describeDay(utcDate(2026, 4, 2)).colour, 'white');
  });

  it('is black on All Souls’ Day', () => {
    assert.equal(describeDay(utcDate(2026, 11, 2)).colour, 'black');
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
