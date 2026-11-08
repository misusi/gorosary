#!/usr/bin/env node
/**
 * Prints the lectionary slots that need content.
 *
 *   npm run plan --workspace @gorosary/content -- 2026
 *
 * The number is the calendar year whose Advent opens the liturgical year.
 * The output is split into two lists:
 *
 *   - Slots whose readings never change from year to year. These go in one
 *     document with `cycle: common`.
 *   - Slots whose readings depend on the three-year cycle. These go in one
 *     document per cycle year.
 *
 * Every Sunday slot and every named solemnity is listed with the date it
 * falls on, so a writer can work through them in order and check that the
 * Gospel readings run in sequence through the book.
 */
import { addDays } from '../src/calendar/dates.js';
import { liturgicalYear } from '../src/calendar/liturgical.js';
import { lectionaryPosition } from '../src/calendar/lectionary.js';

const cycleStartYear = Number(process.argv[2] ?? '2026');
if (!Number.isFinite(cycleStartYear)) {
  console.error('Usage: tsx scripts/plan-lectionary.ts <cycle start year>');
  process.exit(1);
}

const year = liturgicalYear(cycleStartYear);
const letters = ['A', 'B', 'C'];
const letter = letters[((cycleStartYear - 2021) % 3 + 3) % 3] ?? 'A';

/** Slots whose readings are the same in every cycle year. */
const FIXED_SLOTS = new Set([
  'named:christmas',
  'named:mary-mother-of-god',
  'named:epiphany',
  'named:baptism-of-the-lord',
  'named:holy-family',
  'named:assumption',
  'named:all-saints',
  'named:immaculate-conception',
  'named:ash-wednesday',
  'named:palm-sunday',
  'named:holy-thursday',
  'named:good-friday',
  'named:holy-saturday',
  'named:easter',
  'named:ascension',
  'named:pentecost',
  'named:trinity',
  'named:corpus-christi',
  // The Christmas weekdays keep the same readings every year.
  'named:christmas-26',
  'named:christmas-27',
  'named:christmas-28',
  'named:christmas-29',
  'named:christmas-30',
  'named:christmas-31',
]);

console.log(`\nCycle year ${letter} — liturgical year opening Advent ${cycleStartYear}`);
console.log(`Easter ${year.easter.toISOString().slice(0, 10)}`);
console.log(`Ash Wednesday ${year.ashWednesday.toISOString().slice(0, 10)}\n`);

const start = year.adventStart;
const end = addDays(year.adventStart, 365);

const seen = new Set<string>();
const cycleRows: { date: string; slot: string; label: string }[] = [];
const fixedRows: { date: string; slot: string; label: string }[] = [];

for (
  let day = new Date(start.getTime());
  day < end;
  day = addDays(day, 1)
) {
  const position = lectionaryPosition(day);
  const isNamed = position.slot.startsWith('named:');
  if (!position.isSunday && !isNamed) continue;
  if (seen.has(position.slot)) continue;
  seen.add(position.slot);
  const row = {
    date: day.toISOString().slice(0, 10),
    slot: position.slot,
    label: position.label,
  };
  if (FIXED_SLOTS.has(position.slot)) fixedRows.push(row);
  else cycleRows.push(row);
}

console.log('--- fixed readings (the same every year) ---');
for (const row of fixedRows) {
  console.log(`${row.date}  ${row.slot.padEnd(30)} ${row.label}`);
}

console.log('\n--- cycle-dependent readings (year ' + letter + ') ---');
for (const row of cycleRows) {
  console.log(`${row.date}  ${row.slot.padEnd(30)} ${row.label}`);
}

console.log(
  `\n${fixedRows.length} fixed slots, ${cycleRows.length} slots for cycle year ${letter}.\n`,
);
