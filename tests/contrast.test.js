import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkContrastPairs } from '../src/index.js';

const input = {
  canvas: '#fff',
  pairs: [
    { name: 'body', text: '#000000', surface: '#FFFFFFFF' },
    { name: 'muted-label', text: '#0008', surface: '#0004' },
    { name: 'transparent', text: '#ff000000', surface: '#083' },
    { name: 'internal-policy', text: '#f00', surface: '#000', minimum: 5.5 }
  ]
};

test('checks opaque, two translucent layers and invisible text in input order', () => {
  const results = checkContrastPairs(input);
  assert.deepEqual(results[0], { name: 'body', ratio: 21, minimum: 4.5, pass: true });
  // Gray background = 11/15, covered gray = 77/225. Evaluate both grays independently.
  const grayRatio = (((11 / 15 + 0.055) / 1.055) ** 2.4 + 0.05) /
    (((77 / 225 + 0.055) / 1.055) ** 2.4 + 0.05);
  assert.ok(Math.abs(results[1].ratio - grayRatio) < 1e-12);
  assert.equal(results[1].pass, false);
  assert.deepEqual(results[2], { name: 'transparent', ratio: 1, minimum: 4.5, pass: false });
  assert.ok(Math.abs(results[3].ratio - 5.252) < 1e-12);
  assert.equal(results[3].pass, false);
});

test('compares the full ratio, including values just below the threshold', () => {
  const pair = { name: 'boundary', text: '#777', surface: '#fff' };
  const check = minimum => checkContrastPairs({ canvas: '#fff', pairs: [{ ...pair, minimum }] })[0];
  const result = check(4.5);
  assert.ok(result.ratio > 4.47 && result.ratio < 4.5);
  assert.equal(result.pass, false);
  assert.equal(check(result.ratio).pass, true);
});

test('rejects unsupported syntax, ambiguous names, bad thresholds and missing canvas', () => {
  const pair = input.pairs[0];
  for (const patch of [{ text: '#000\n' }, { surface: 'white' }, { minimum: '4.5' },
    { minimum: Infinity }, { name: ' ' }]) {
    assert.throws(() => checkContrastPairs({ ...input, pairs: [{ ...pair, ...patch }] }));
  }
  assert.throws(() => checkContrastPairs({ ...input, pairs: [pair, pair] }), /unique/);
  assert.throws(() => checkContrastPairs({ ...input, canvas: '#fff8' }), /opaque/);
  assert.throws(() => checkContrastPairs({ pairs: input.pairs }), /canvas/);
  assert.throws(() => checkContrastPairs({ ...input, pairs: Array(1001).fill(pair) }), /1000/);
});
