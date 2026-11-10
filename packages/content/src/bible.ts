import bible from '../bible/douay-rheims.json' with { type: 'json' };

/**
 * The Douay-Rheims text, and the means of finding a verse in it.
 *
 * The readings name their Scripture the way the lectionary does — "Titus
 * 2:1-8, 11-14", "1 Samuel 9:1-4, 17-19; 10:1a" — so the citation has
 * to be understood before the text can be shown.
 */

interface Verse {
  v: string;
  t: string;
}

const BOOK = bible as unknown as Record<string, Record<string, Verse[]>>;

/**
 * The names the readings use, and the names the Douay-Rheims uses.
 *
 * The Douay-Rheims follows the Vulgate, so several of its books carry older
 * names: 1 Samuel is "1 Kings", 1 Chronicles is "1 Paralipomenon", Ezra is
 * "1 Esdras", and the Song of Songs is the "Canticle of Canticles".
 */
const BOOK_NAMES: Record<string, string> = {
  Acts: 'Acts',
  Amos: 'Amos',
  Baruch: 'Baruch',
  Colossians: 'Colossians',
  Daniel: 'Daniel',
  Deuteronomy: 'Deuteronomy',
  Ecclesiastes: 'Ecclesiastes',
  Ephesians: 'Ephesians',
  Ex: 'Exodus',
  Exodus: 'Exodus',
  Ezekiel: 'Ezechiel',
  Ezra: '1 Esdras',
  Galatians: 'Galatians',
  Genesis: 'Genesis',
  Habakkuk: 'Habacuc',
  Haggai: 'Aggeus',
  Hebrews: 'Hebrews',
  Hosea: 'Osee',
  Is: 'Isaias',
  Isaiah: 'Isaias',
  James: 'James',
  Jeremiah: 'Jeremias',
  Jn: 'John',
  Job: 'Job',
  Joel: 'Joel',
  John: 'John',
  Jonah: 'Jonas',
  Joshua: 'Josue',
  Jude: 'Jude',
  Judges: 'Judges',
  Lamentations: 'Lamentations',
  Leviticus: 'Leviticus',
  Luke: 'Luke',
  Malachi: 'Malachias',
  Mark: 'Mark',
  Matthew: 'Matthew',
  Micah: 'Micheas',
  Nahum: 'Nahum',
  Nehemiah: '2 Esdras',
  Numbers: 'Numbers',
  Philemon: 'Philemon',
  Philippians: 'Philippians',
  Proverbs: 'Proverbs',
  Psalm: 'Psalms',
  Psalms: 'Psalms',
  Revelation: 'Apocalypse',
  Romans: 'Romans',
  Ruth: 'Ruth',
  Sirach: 'Ecclesiasticus',
  'Song of Songs': 'Canticle of Canticles',
  Titus: 'Titus',
  Tobit: 'Tobias',
  Wisdom: 'Wisdom',
  Zechariah: 'Zacharias',
  Zephaniah: 'Sophonias',
  '1 Samuel': '1 Kings',
  '2 Samuel': '2 Kings',
  '1 Kings': '3 Kings',
  '2 Kings': '4 Kings',
  '3 Kings': '3 Kings',
  '4 Kings': '4 Kings',
  '1 Chronicles': '1 Paralipomenon',
  '2 Chronicles': '2 Paralipomenon',
  '1 Esdras': '1 Esdras',
  '2 Esdras': '2 Esdras',
  '1 Maccabees': '1 Machabees',
  '2 Maccabees': '2 Machabees',
  '1 Corinthians': '1 Corinthians',
  '2 Corinthians': '2 Corinthians',
  '1 Thessalonians': '1 Thessalonians',
  '2 Thessalonians': '2 Thessalonians',
  '1 Timothy': '1 Timothy',
  '2 Timothy': '2 Timothy',
  '1 Peter': '1 Peter',
  '2 Peter': '2 Peter',
  '1 John': '1 John',
  '2 John': '2 John',
  '3 John': '3 John',
};

/**
 * The psalter is numbered differently.
 *
 * The lectionary counts the psalms as the Hebrew does; the Douay-Rheims
 * counts them as the Vulgate does, which joins the ninth and tenth psalms
 * and so runs one behind from the eleventh onwards. The readings use the
 * Hebrew number, so it has to be translated.
 */
function psalmChapter(hebrew: number): number {
  if (hebrew <= 9) return hebrew;
  if (hebrew === 10) return 9;
  return hebrew - 1;
}

export interface Passage {
  book: string;
  chapter: number;
  verses: number[];
}

/** How many verses a letter runs on for: "a" is one more, "c" three. */
const LETTER_RUNS: Record<string, number> = { a: 1, b: 2, c: 3 };

/**
 * Read a citation such as "1 Samuel 9:1-4, 17-19; 10:1a".
 *
 * The letters are the lectionary's way of saying that a verse runs on into
 * the next one.
 */
export function parseCitation(reference: string): Passage[] {
  // Where a reading has two forms, the first is the one to show.
  const first = reference.split(/\s+or\s+/)[0] ?? reference;
  const passages: Passage[] = [];

  // A whole psalm: "Psalm 51".
  const wholePsalm = first.match(/^Psalm(?:s)?\s+(\d+)$/);
  if (wholePsalm) {
    const chapter = psalmChapter(Number(wholePsalm[1]));
    const verses = Object.values(BOOK['Psalms']?.[String(chapter)] ?? {}).map(
      (verse) => Number(verse.v),
    );
    if (verses.length > 0) {
      passages.push({ book: 'Psalms', chapter, verses });
    }
    return passages;
  }

  let book = '';
  let chapter = 0;

  for (const part of first.split(';')) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    // The book may be named again in a later part of the citation. Several
    // of them begin with a number — 1 Samuel, 2 Corinthians — so the number
    // is part of the name.
    const named = trimmed.match(/^((?:\d\s)?[A-Za-z][A-Za-z .]*?)\s+(\d.*)$/);
    let rest = trimmed;
    if (named) {
      book = named[1]!.trim();
      rest = named[2]!.trim();
    }

    const resolved = BOOK_NAMES[book];
    if (!resolved) continue;

    for (const chunk of rest.split(',')) {
      const piece = chunk.trim();
      if (!piece) continue;

      // A chapter and a range of verses: "1:4-8".
      const inChapter = piece.match(
        /^(\d+):(\d+)([a-c])?(?:-(\d+)([a-c])?)?$/,
      );
      if (inChapter) {
        chapter = Number(inChapter[1]);
        const from = Number(inChapter[2]);
        const to = inChapter[4] ? Number(inChapter[4]) : from;
        const letter = inChapter[3] ?? inChapter[5];

        const verses: number[] = [];
        for (let v = from; v <= to; v += 1) verses.push(v);
        // A letter on a verse that stands alone means it runs on.
        if (letter && !inChapter[4]) {
          for (let v = from + 1; v <= from + (LETTER_RUNS[letter] ?? 0); v += 1) {
            verses.push(v);
          }
        }
        passages.push({ book: resolved, chapter, verses });
        continue;
      }

      // A range that crosses a chapter: "3:22-4:6".
      const across = piece.match(/^(\d+):(\d+)-(\d+):(\d+)$/);
      if (across) {
        const firstChapter = Number(across[1]);
        const lastChapter = Number(across[3]);
        const from = Number(across[2]);
        const to = Number(across[4]);

        const first = Object.values(
          BOOK[resolved]?.[String(firstChapter)] ?? {},
        ).map((verse) => Number(verse.v));
        const last = Object.values(
          BOOK[resolved]?.[String(lastChapter)] ?? {},
        ).map((verse) => Number(verse.v));

        const verses = [
          ...first.filter((v) => v >= from),
          ...last.filter((v) => v <= to),
        ];
        passages.push({ book: resolved, chapter: firstChapter, verses });
        chapter = lastChapter;
        continue;
      }

      // Verses with no chapter of their own, carrying the last one over.
      const bare = piece.match(/^(\d+)([a-c])?(?:-(\d+)([a-c])?)?$/);
      if (bare && chapter) {
        const from = Number(bare[1]);
        const to = bare[3] ? Number(bare[3]) : from;
        const letter = bare[2] ?? bare[4];

        const verses: number[] = [];
        for (let v = from; v <= to; v += 1) verses.push(v);
        if (letter && !bare[3]) {
          for (let v = from + 1; v <= from + (LETTER_RUNS[letter] ?? 0); v += 1) {
            verses.push(v);
          }
        }
        passages.push({ book: resolved, chapter, verses });
      }
    }
  }

  // A citation that lists its verses in two goes is one passage.
  const merged: Passage[] = [];
  for (const passage of passages) {
    const last = merged.at(-1);
    if (
      last &&
      last.book === passage.book &&
      last.chapter === passage.chapter &&
      last.verses.at(-1)! < passage.verses[0]!
    ) {
      last.verses.push(...passage.verses);
      continue;
    }
    merged.push(passage);
  }

  return merged;
}

/** The text of a passage, verse by verse. */
export function passageText(passage: Passage): { verse: string; text: string }[] {
  const chapter = BOOK[passage.book]?.[String(passage.chapter)] ?? [];
  const byNumber = new Map(chapter.map((verse) => [Number(verse.v), verse.t]));

  return passage.verses
    .map((number) => {
      const text = byNumber.get(number);
      return text === undefined ? null : { verse: String(number), text };
    })
    .filter((entry): entry is { verse: string; text: string } => entry !== null);
}

/** The full text of a reading, or null when the citation cannot be found. */
export function readingText(
  reference: string,
): { verse: string; text: string }[] | null {
  const passages = parseCitation(reference);
  if (passages.length === 0) return null;

  const verses = passages.flatMap(passageText);
  return verses.length > 0 ? verses : null;
}
