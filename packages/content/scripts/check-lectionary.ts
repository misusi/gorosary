#!/usr/bin/env node
/**
 * Reviews the lectionary content.
 *
 *   npm run check:lectionary --workspace @gorosary/content
 *
 * The Roman Lectionary is a large body of citations, and a wrong reference
 * in a prayer app is a real defect. This does not decide whether a citation
 * is right — nothing can, short of the official lectionary — but it checks
 * the things that can be checked mechanically:
 *
 *   1. Every Sunday of every cycle year is present.
 *   2. Within Ordinary Time, the Gospel readings run forwards through the
 *      Gospel book without jumping back. Year A marches through Matthew,
 *      Year B through Mark, Year C through Luke. A citation that goes
 *      backwards is almost always wrong.
 *   3. The Sundays whose Gospel is known with certainty are present and
 *      correct.
 */
import { content } from '../src/generated/content.js';
import { cycleSundaySlots } from '../src/calendar/lectionary.js';
import type { CycleYear } from '../src/calendar/lectionary.js';

const GOSPEL_BOOK: Record<CycleYear, string> = {
  a: 'Matthew',
  b: 'Mark',
  c: 'Luke',
};

/**
 * The Sundays whose Gospel is not in doubt. If one of these disagrees with
 * the content, the content is wrong.
 */
const ANCHORS: Record<CycleYear, Record<string, string>> = {
  a: {
    'ordinary:1:0': 'Matthew 3:13-17',
    'ordinary:2:0': 'Matthew 4:1-11',
    'lent:6:0': 'Matthew 17:1-13',
    'easter:2:0': 'Matthew 28:8-15',
    'named:christ-the-king': 'Matthew 25:31-46',
  },
  b: {
    'ordinary:1:0': 'Mark 1:14-20, 21-43',
    'ordinary:2:0': 'Mark 1:35-42',
    'lent:6:0': 'Mark 9:2-10',
    'easter:2:0': 'Mark 16:9-20',
    'named:christ-the-king': 'John 18:33-37',
  },
  c: {
    'ordinary:1:0': 'Luke 4:16-21',
    'ordinary:2:0': 'Luke 4:25-32',
    'lent:6:0': 'Luke 9:23-36',
    'easter:2:0': 'Luke 24:13-35',
    'named:christ-the-king': 'Luke 23:15-16, 18-20',
  },
};

interface Parsed {
  book: string;
  chapter: number;
  verse: number;
}

function parseReference(reference: string): Parsed | null {
  const match = /^([1-3]?\s?[A-Za-z]+)\s+(\d+):(\d+)/.exec(reference.trim());
  if (!match) return null;
  const book = (match[1] ?? '').trim();
  const chapter = Number(match[2]);
  const verse = Number(match[3]);
  if (!Number.isFinite(chapter) || !Number.isFinite(verse)) return null;
  return { book, chapter, verse };
}

function positionOf(reference: string): number | null {
  const parsed = parseReference(reference);
  if (!parsed) return null;
  return parsed.chapter * 1000 + parsed.verse;
}

let problems = 0;
const warn = (message: string) => {
  problems += 1;
  console.log(`  ! ${message}`);
};

for (const cycle of ['a', 'b', 'c'] as CycleYear[]) {
  const doc = content.find(
    (entry) => entry.kind === 'readings' && entry.cycle === cycle,
  );

  console.log(`\n=== Cycle year ${cycle.toUpperCase()} ===`);

  if (!doc || doc.kind !== 'readings') {
    warn(`no document for cycle year ${cycle}`);
    continue;
  }

  const bySlot = new Map(doc.entries.map((entry) => [entry.slot, entry]));

  // 1. Coverage
  const required = cycleSundaySlots(cycle);
  const missing = required.filter((slot) => !bySlot.has(slot));
  console.log(`  ${required.length - missing.length} of ${required.length} Sundays present`);
  for (const slot of missing) warn(`missing "${slot}"`);

  // 2. The Gospel sequence through Ordinary Time
  const gospelBook = GOSPEL_BOOK[cycle];
  let previous: { position: number; reference: string } | null = null;
  let steps = 0;

  for (const slot of required) {
    if (!slot.startsWith('ordinary:')) continue;
    const entry = bySlot.get(slot);
    const reference = entry?.gospel?.reference;
    if (!reference) {
      warn(`${slot}: no Gospel`);
      continue;
    }
    const parsed = parseReference(reference);
    if (!parsed) {
      warn(`${slot}: cannot read the Gospel reference "${reference}"`);
      continue;
    }
    const position = positionOf(reference);
    if (position === null) continue;

    if (
      previous &&
      parsed.book === gospelBook &&
      previous.reference.startsWith(gospelBook) &&
      position < previous.position
    ) {
      warn(
        `${slot}: the Gospel goes backwards — ${previous.reference} then ${reference}`,
      );
    }
    if (parsed.book === gospelBook) {
      previous = { position, reference };
    }
    steps += 1;
  }
  console.log(`  ${steps} Ordinary Time Sundays checked for order`);

  // 3. The anchors
  for (const [slot, expected] of Object.entries(ANCHORS[cycle])) {
    const entry = bySlot.get(slot);
    const actual = entry?.gospel?.reference;
    if (!actual) {
      warn(`${slot}: no Gospel, expected ${expected}`);
      continue;
    }
    if (actual !== expected) {
      warn(`${slot}: the Gospel is "${actual}", expected "${expected}"`);
    }
  }
}

console.log(
  problems === 0
    ? '\nNo problems found. Every Sunday is present, the Gospels run in order, and the anchors match.\n'
    : `\n${problems} thing(s) to look at.\n`,
);

process.exit(problems === 0 ? 0 : 1);
