import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { content } from '../src/generated/content.js';
import {
  buildNovenaSteps,
  buildRosarySteps,
  type RunnerStep,
} from '../src/rosary-steps.js';

/**
 * The order of the Rosary.
 *
 * It is a decision, not an accident: the Creed and the Oh My Jesus were
 * missing once, and the mystery is announced before each decade so that it
 * is meditated on rather than recited. A novena has to include the whole
 * Rosary — the reader is not assumed to know what to say.
 */

const joyful = content.find((doc) => doc.id === 'joyful-mysteries');
if (!joyful || joyful.kind !== 'rosary') {
  throw new Error('the Joyful Mysteries document is missing');
}
const set = joyful.sets[0]!;
const steps = buildRosarySteps(set);

const labels = (list: RunnerStep[]) => list.map((step) => step.label);

describe('the read-along of the Rosary', () => {
  it('begins with the sign of the cross, the Creed and the three Hail Marys', () => {
    assert.deepEqual(labels(steps).slice(0, 8), [
      'The Sign of the Cross',
      "The Apostles' Creed",
      'Our Father',
      'Hail Mary 1 of 3',
      'Hail Mary 2 of 3',
      'Hail Mary 3 of 3',
      'Glory Be',
      'The First Mystery — The Annunciation',
    ]);
  });

  it('announces each mystery before its decade', () => {
    const announced = steps.filter((step) => step.label.includes('Mystery — '));
    assert.deepEqual(announced.map((step) => step.label), [
      'The First Mystery — The Annunciation',
      'The Second Mystery — The Visitation',
      'The Third Mystery — The Nativity',
      'The Fourth Mystery — The Presentation in the Temple',
      'The Fifth Mystery — The Finding in the Temple',
    ]);
  });

  it('says the Our Father, ten Hail Marys, the Glory Be and the Oh My Jesus in every decade', () => {
    const firstDecade = labels(steps).slice(8, 21);
    assert.deepEqual(firstDecade, [
      'Decade 1 — Our Father',
      'Decade 1 — Hail Mary 1 of 10',
      'Decade 1 — Hail Mary 2 of 10',
      'Decade 1 — Hail Mary 3 of 10',
      'Decade 1 — Hail Mary 4 of 10',
      'Decade 1 — Hail Mary 5 of 10',
      'Decade 1 — Hail Mary 6 of 10',
      'Decade 1 — Hail Mary 7 of 10',
      'Decade 1 — Hail Mary 8 of 10',
      'Decade 1 — Hail Mary 9 of 10',
      'Decade 1 — Hail Mary 10 of 10, for the mystery',
      'Decade 1 — Glory Be',
      'Decade 1 — Oh My Jesus',
    ]);
  });

  it('ends with the Hail, Holy Queen, the closing prayer and the sign of the cross', () => {
    assert.deepEqual(labels(steps).slice(-3), [
      'Hail, Holy Queen',
      'A Prayer to Close',
      'The Sign of the Cross',
    ]);
  });

  it('has eighty steps', () => {
    // 3 + 3 + 1 before the decades, 14 in each of the five decades, and 3
    // after them.
    assert.equal(steps.length, 80);
  });

  it('carries the meditation on the tenth Hail Mary of each decade', () => {
    const tenth = steps.find(
      (step) => step.label === 'Decade 3 — Hail Mary 10 of 10, for the mystery',
    );
    assert.equal(tenth?.meditation, set.mysteries[2]?.meditation);
    assert.equal(tenth?.scripture, set.mysteries[2]?.scripture);
  });
});

describe('the read-along of a novena day', () => {
  const day = { day: 1, title: 'A saint', text: 'The prayer of the day.' };
  const steps = buildNovenaSteps(day);

  it('begins with the sign of the cross and the prayer of the day', () => {
    assert.equal(steps[0]?.label, 'The Sign of the Cross');
    assert.equal(steps[1]?.label, 'Day 1 — A saint');
    assert.equal(steps[1]?.text, 'The prayer of the day.');
  });

  it('includes the whole Rosary, with nothing left out', () => {
    const all = labels(steps);
    for (const wanted of [
      "The Apostles' Creed",
      'Our Father',
      'Hail Mary 1 of 3',
      'Glory Be',
      'Decade 1 — Our Father',
      'Decade 5 — Oh My Jesus',
      'Hail, Holy Queen',
      'A Prayer to Close',
      'The Sign of the Cross',
    ]) {
      assert.ok(all.includes(wanted), `${wanted} is missing`);
    }
  });

  it('says the whole Rosary and nothing after it', () => {
    assert.equal(steps.length, 76);
    assert.equal(steps[steps.length - 1]?.label, 'The Sign of the Cross');
  });
});
