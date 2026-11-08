#!/usr/bin/env node
/**
 * Turns the extracted USCCB liturgical calendar into content files.
 *
 *   npm run generate:readings --workspace @gorosary/content -- <json> <out-dir>
 *
 * The USCCB publishes a liturgical calendar for each calendar year as a PDF.
 * `usccb-extract.py` reads those PDFs into a JSON file; this script writes one
 * content document per calendar year, keyed by date.
 *
 * The readings are therefore not written by hand at all — they come from the
 * same calendar the dioceses of the United States use, which is the point.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

interface ExtractedDay {
  date: string;
  weekday: string;
  celebration: string;
  colour: string | null;
  firstReading: string | null;
  psalm: string | null;
  secondReading: string | null;
  gospel: string | null;
  lectionaryNumber: string;
}

interface ExtractedYear {
  cycles: {
    sundayCycle: string;
    from: string;
    to: string;
    weekdayCycle: string | null;
  }[];
  days: Record<string, ExtractedDay>;
}

const jsonPath = process.argv[2];
const outDir = process.argv[3];

if (!jsonPath || !outDir) {
  console.error(
    'Usage: tsx scripts/generate-readings.ts <readings.json> <content/readings>',
  );
  process.exit(1);
}

const data = JSON.parse(
  readFileSync(jsonPath, 'utf8'),
) as Record<string, ExtractedYear>;

/** YAML needs a quoted string when it might be read as something else. */
function yamlString(value: string): string {
  const needsQuotes = /[:#\[\]{}&*!|>'"%@`]|^[\s-]|\s$/.test(value);
  if (!needsQuotes) return value;
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

/**
 * The calendars print some celebrations in capitals for emphasis. Title case
 * reads better in the app, and mixed-case words are left alone.
 */
function tidyCelebration(text: string): string {
  return text
    .split(' ')
    .map((word) => {
      const bare = word.replace(/[^A-Za-z]/g, '');
      if (bare.length >= 2 && bare === bare.toUpperCase()) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return word;
    })
    .join(' ');
}

/**
 * The US calendars overlap: the calendar for 2024 begins with the last days
 * of Advent in December 2023, and the calendar for 2023 ends with the same
 * days. So every date is merged across the PDFs, preferring the calendar
 * whose own year the date falls in.
 */
const allDays = new Map<string, ExtractedDay>();
for (const [pdfYear, payload] of Object.entries(data)) {
  for (const day of Object.values(payload.days)) {
    const existing = allDays.get(day.date);
    const ownYear = day.date.slice(0, 4) === pdfYear;
    const existingIsOwn =
      existing !== undefined && existing.date.slice(0, 4) === pdfYear;
    if (!existing || (ownYear && !existingIsOwn)) {
      allDays.set(day.date, day);
    }
  }
}

const byCalendarYear = new Map<string, ExtractedDay[]>();
for (const day of allDays.values()) {
  const year = day.date.slice(0, 4);
  const list = byCalendarYear.get(year) ?? [];
  list.push(day);
  byCalendarYear.set(year, list);
}

mkdirSync(outDir, { recursive: true });

let total = 0;

for (const [year, days] of [...byCalendarYear.entries()].sort()) {
  days.sort((a, b) => a.date.localeCompare(b.date));
  if (days.length === 0) continue;
  const payload = data[year] ?? Object.values(data)[0];
  const sundayCycle = payload?.cycles[0]?.sundayCycle ?? '?';
  const weekdayCycle = payload?.cycles[0]?.weekdayCycle ?? '?';

  const lines: string[] = [];
  lines.push('---');
  lines.push(`id: lectionary-${year}`);
  lines.push('kind: readings');
  lines.push('section: readings');
  lines.push(`title: The Liturgical Calendar of ${year}`);
  lines.push(
    `subtitle: The readings of every day of ${year}, Year ${sundayCycle.toUpperCase()}`,
  );
  lines.push(
    `summary: The readings of the Roman Lectionary for every day of ${year} — the First Reading, the Psalm, the Second Reading, and the Gospel.`,
  );
  lines.push(`order: ${Number(year) - 2020}`);
  lines.push(`year: ${year}`);
  lines.push('edition: The Roman Lectionary (United States)');
  lines.push(
    'attribution: The liturgical calendar of the United States Conference of Catholic Bishops, from the Lectionary for Mass for the dioceses of the United States of America.',
  );
  lines.push('tags: [readings, lectionary, calendar]');
  lines.push('entries:');

  for (const day of days) {
    lines.push(`  - date: "${day.date}"`);
    if (day.celebration) {
      lines.push(
        `    celebration: ${yamlString(tidyCelebration(day.celebration))}`,
      );
    }
    if (day.colour) {
      lines.push(`    colour: ${day.colour}`);
    }
    if (day.firstReading) {
      lines.push('    firstReading:');
      lines.push(`      reference: ${yamlString(day.firstReading)}`);
    }
    if (day.psalm) {
      lines.push('    psalm:');
      lines.push(`      reference: ${yamlString(day.psalm)}`);
    }
    if (day.secondReading) {
      lines.push('    secondReading:');
      lines.push(`      reference: ${yamlString(day.secondReading)}`);
    }
    if (day.gospel) {
      lines.push('    gospel:');
      lines.push(`      reference: ${yamlString(day.gospel)}`);
    }
  }
  lines.push('---');

  const file = join(outDir, `lectionary-${year}.md`);
  writeFileSync(file, `${lines.join('\n')}\n`, 'utf8');
  total += days.length;
  console.log(
    `  ${year}: ${days.length} days (Sunday cycle ${sundayCycle.toUpperCase()}, weekday cycle ${weekdayCycle})`,
  );
}

console.log(`wrote ${total} days of readings to ${outDir}`);
