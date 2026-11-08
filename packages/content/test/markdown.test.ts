import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseBlocks, parseInline, plainText } from '../src/markdown.js';

describe('block parsing', () => {
  it('splits paragraphs on blank lines', () => {
    const blocks = parseBlocks('One.\n\nTwo.');
    assert.equal(blocks.length, 2);
    assert.equal(blocks[0]?.type, 'paragraph');
    assert.equal(blocks[0]?.type === 'paragraph' ? blocks[0].text : '', 'One.');
  });

  it('joins a wrapped paragraph into one block', () => {
    const blocks = parseBlocks('One\ntwo\nthree.');
    assert.equal(blocks.length, 1);
    assert.equal(blocks[0]?.type === 'paragraph' ? blocks[0].text : '', 'One two three.');
  });

  it('reads headings with their level', () => {
    const blocks = parseBlocks('## A heading');
    assert.equal(blocks[0]?.type, 'heading');
    assert.equal(blocks[0]?.type === 'heading' ? blocks[0].level : 0, 2);
    assert.equal(blocks[0]?.type === 'heading' ? blocks[0].text : '', 'A heading');
  });

  it('reads a rubric as a quote', () => {
    const blocks = parseBlocks('> Say this slowly.');
    assert.equal(blocks[0]?.type, 'quote');
  });

  it('reads bullet and numbered lists', () => {
    const bullets = parseBlocks('- one\n- two');
    assert.equal(bullets[0]?.type, 'list');
    assert.equal(bullets[0]?.type === 'list' ? bullets[0].ordered : true, false);
    assert.equal(bullets[0]?.type === 'list' ? bullets[0].items.length : 0, 2);

    const numbered = parseBlocks('1. one\n2. two');
    assert.equal(numbered[0]?.type === 'list' ? numbered[0].ordered : false, true);
  });

  it('does not mistake emphasis for a bullet', () => {
    const blocks = parseBlocks('*italic* text');
    assert.equal(blocks.length, 1);
    assert.equal(blocks[0]?.type, 'paragraph');
  });

  it('keeps a wrapped list item inside the list', () => {
    const blocks = parseBlocks(
      '- The first item\n  continues onto a second line.\n- The second item',
    );
    assert.equal(blocks.length, 1);
    assert.equal(blocks[0]?.type, 'list');
    const items = blocks[0]?.type === 'list' ? blocks[0].items : [];
    assert.equal(items.length, 2);
    assert.equal(items[0], 'The first item continues onto a second line.');
    assert.equal(items[1], 'The second item');
  });

  it('keeps a wrapped ordered item inside the list', () => {
    const blocks = parseBlocks('1. First\n   and its continuation.');
    assert.equal(blocks.length, 1);
    assert.equal(blocks[0]?.type, 'list');
    assert.equal(
      blocks[0]?.type === 'list' ? blocks[0].items[0] : '',
      'First and its continuation.',
    );
  });

  it('ends a list at a blank line', () => {
    const blocks = parseBlocks('- one\n\nA paragraph.');
    assert.equal(blocks.length, 2);
    assert.equal(blocks[0]?.type, 'list');
    assert.equal(blocks[1]?.type, 'paragraph');
  });

  it('ignores empty input', () => {
    assert.deepEqual(parseBlocks(''), []);
    assert.deepEqual(parseBlocks('\n\n\n'), []);
  });
});

describe('inline parsing', () => {
  it('keeps plain text as one token', () => {
    assert.deepEqual(parseInline('plain'), [{ kind: 'text', text: 'plain' }]);
  });

  it('splits bold and italic', () => {
    assert.deepEqual(parseInline('a **b** c'), [
      { kind: 'text', text: 'a ' },
      { kind: 'bold', text: 'b' },
      { kind: 'text', text: ' c' },
    ]);
  });

  it('handles underscores as well as asterisks', () => {
    assert.deepEqual(parseInline('__bold__ and _italic_'), [
      { kind: 'bold', text: 'bold' },
      { kind: 'text', text: ' and ' },
      { kind: 'italic', text: 'italic' },
    ]);
  });

  it('strips markers for plain text', () => {
    assert.equal(plainText('a **b** _c_'), 'a b c');
  });
});
