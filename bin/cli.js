#!/usr/bin/env node
import { TextDecoder } from 'node:util';
import { checkContrastPairs } from '../src/index.js';

try {
  if (process.argv.length === 3 && process.argv[2] === '--help') {
    process.stdout.write('Usage: layer-contrast-check < contrast.json\nExit: 0 all pass, 1 policy failure, 2 invalid input.\n');
    process.exit(0);
  }
  if (process.argv.length !== 2) throw new Error('pipe a JSON document to stdin');
  const chunks = [];
  let bytes = 0;
  for await (const chunk of process.stdin) {
    bytes += chunk.length;
    if (bytes > 512 * 1024) throw new Error('input exceeds 512 KiB');
    chunks.push(chunk);
  }
  let input;
  try {
    input = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks)));
  } catch {
    throw new Error('input must be valid UTF-8 JSON');
  }
  const results = checkContrastPairs(input);
  process.stdout.write(JSON.stringify({ results }) + '\n');
  process.exitCode = results.every(result => result.pass) ? 0 : 1;
} catch (error) {
  process.stderr.write(`layer-contrast-check: ${error.message}\n`);
  process.exitCode = 2;
}
