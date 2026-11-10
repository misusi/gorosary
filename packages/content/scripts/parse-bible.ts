/**
 * Turn the Douay-Rheims text into one JSON file per book.
 *
 * The source is the complete Bible from Project Gutenberg (ebook 1581),
 * which is in the public domain. The verses are what the lectionary quotes,
 * so they are stored as plain data rather than as prose.
 *
 *   node --import tsx scripts/parse-bible.ts <path-to-pg1581.txt>
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const source = process.argv[2];
if (!source) {
  console.error('usage: parse-bible.ts <path-to-pg1581.txt>');
  process.exit(1);
}

const OUT = join(dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..', 'bible');

interface Verse {
  v: string;
  t: string;
}

const lines = readFileSync(source, 'utf8').split(/\r?\n/);

const books: Record<string, Record<string, Verse[]>> = {};
let book = '';
let chapter = '';
let collecting = false;

for (const raw of lines) {
  const line = raw.trim();

  const heading = line.match(/^(.+?) Chapter (\d+)$/);
  if (heading) {
    book = heading[1]!.trim();
    chapter = heading[2]!;
    books[book] ??= {};
    books[book]![chapter] ??= [];
    continue;
  }

  const verse = line.match(/^(\d+):(\d+)\.\s+(.*)$/);
  if (verse && book) {
    const [, c, v, ...rest] = verse;
    books[book]![c!] ??= [];
    books[book]![c!]!.push({ v: v!, t: rest.join(' ').trim() });
    collecting = true;
    continue;
  }

  // A verse runs on to the next line, and ends at the blank line after it.
  if (collecting) {
    if (line === '') {
      collecting = false;
      continue;
    }
    const last = books[book]![chapter]?.at(-1);
    if (last) last.t = `${last.t} ${line}`.trim();
  }
}

mkdirSync(OUT, { recursive: true });

const whole: Record<string, Record<string, Verse[]>> = {};
let bookCount = 0;
let verseCount = 0;
for (const [name, chapters] of Object.entries(books)) {
  const out: Record<string, Verse[]> = {};
  for (const [c, verses] of Object.entries(chapters)) out[c] = verses;
  whole[name] = out;
  bookCount += 1;
  verseCount += Object.values(out).reduce((n, v) => n + v.length, 0);
}

writeFileSync(
  join(OUT, 'douay-rheims.json'),
  JSON.stringify(whole),
  'utf8',
);

console.log(`${bookCount} books, ${verseCount} verses written to ${OUT}`);
