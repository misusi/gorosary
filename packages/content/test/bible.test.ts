import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseCitation, readingText } from '../src/bible.js';

/**
 * Finding a reading in the Douay-Rheims.
 *
 * The lectionary cites Scripture in its own way, and the text is only useful
 * if the citation can be read the way the Church means it.
 */

describe('the citation of a reading', () => {
  it('reads a book and a range of verses', () => {
    assert.deepEqual(parseCitation('John 2:13-22'), [
      { book: 'John', chapter: 2, verses: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22] },
    ]);
  });

  it('carries the chapter over to a second list of verses', () => {
    const passages = parseCitation('Titus 2:1-8, 11-14');
    assert.deepEqual(passages, [
      { book: 'Titus', chapter: 2, verses: [1, 2, 3, 4, 5, 6, 7, 8, 11, 12, 13, 14] },
    ]);
  });

  it('reads the numbered books', () => {
    assert.equal(parseCitation('1 Corinthians 3:9-11')[0]?.book, '1 Corinthians');
    assert.equal(parseCitation('2 Samuel 1:1-4')[0]?.book, '2 Kings');
  });

  it('reads a range that crosses a chapter', () => {
    const passages = parseCitation('1 John 3:22-4:6');
    assert.equal(passages.length, 1);
    assert.equal(passages[0]?.chapter, 3);
    assert.equal(passages[0]?.verses.at(-1), 6);
  });

  it('reads a second chapter after a semicolon', () => {
    const passages = parseCitation('1 Samuel 9:1-4, 17-19; 10:1a');
    assert.equal(passages.length, 2);
    assert.equal(passages[0]?.chapter, 9);
    assert.equal(passages[1]?.chapter, 10);
  });

  it('takes the first of two possible forms', () => {
    const passages = parseCitation('1 Timothy 2:1-8 or 2:1-5');
    assert.equal(passages[0]?.verses.length, 8);
  });

  it('uses the older names the Douay-Rheims uses', () => {
    assert.equal(parseCitation('Ezekiel 47:1-2')[0]?.book, 'Ezechiel');
    assert.equal(parseCitation('Isaiah 40:1-5')[0]?.book, 'Isaias');
    assert.equal(parseCitation('Revelation 21:1-5')[0]?.book, 'Apocalypse');
  });

  it('numbers the psalms as the lectionary does', () => {
    // The lectionary counts the psalms as the Hebrew does, and the
    // Douay-Rheims counts them as the Vulgate does, which runs one behind.
    const passages = parseCitation('Psalm 51');
    assert.equal(passages[0]?.chapter, 50);
    assert.equal(passages[0]?.verses.length, 21);
  });
});

describe('the text of a reading', () => {
  it('finds the verses', () => {
    const verses = readingText('Titus 2:1');
    assert.equal(verses?.length, 1);
    assert.match(verses?.[0]?.text ?? '', /speak thou the things/);
  });

  it('finds the whole of a psalm', () => {
    const verses = readingText('Psalm 100');
    assert.equal(verses?.length, 5);
    assert.match(verses?.[0]?.text ?? '', /psalm of praise/);
  });

  it('has nothing for a citation it cannot find', () => {
    assert.equal(readingText('Wisdom 99:1-5'), null);
  });
});
