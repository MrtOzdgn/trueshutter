import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { readShutterCount } from '../index';

// Ground truth for each fixture was captured with `exiftool -ShutterCount`, not hand-typed —
// see test-samples/README for the exact command run against each file.
const FIXTURES: Array<{ file: string; expectedCount: number; expectedModel: string }> = [
  { file: 'nikon_d40.nef', expectedCount: 676, expectedModel: 'NIKON D40' },
  { file: 'nikon_d5300.nef', expectedCount: 2148, expectedModel: 'NIKON D5300' },
  { file: 'nikon_d3.nef', expectedCount: 14744, expectedModel: 'NIKON D3' },
];

function toFile(path: string, name: string): File {
  const buf = readFileSync(path);
  return new File([buf], name);
}

describe('readShutterCount - Nikon NEF', () => {
  for (const fixture of FIXTURES) {
    it(`extracts the correct shutter count from ${fixture.file}`, async () => {
      const file = toFile(`test-samples/${fixture.file}`, fixture.file);
      const result = await readShutterCount(file);

      expect(result.status).toBe('ok');
      if (result.status === 'ok') {
        expect(result.shutterCount).toBe(fixture.expectedCount);
        expect(result.model.trim()).toBe(fixture.expectedModel);
      }
    });
  }
});
