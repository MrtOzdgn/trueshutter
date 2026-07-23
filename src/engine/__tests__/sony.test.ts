import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { readShutterCount } from '../index';

// Ground truth captured with `exiftool -ShutterCount`, cross-checked against this engine's
// independently-derived decipher table (see transforms/sonyDecipher.ts) — not hand-typed.
const FIXTURES: Array<{ file: string; expectedCount: number; expectedModel: string }> = [
  { file: 'sony_a7m2.arw', expectedCount: 998, expectedModel: 'ILCE-7M2' },
  { file: 'sony_a7r2.arw', expectedCount: 144, expectedModel: 'ILCE-7RM2' },
  { file: 'sony_a6000.arw', expectedCount: 12494, expectedModel: 'ILCE-6000' },
  // Found by batch-validating this engine against the full rawsamples.ch Sony catalog —
  // these all turned out to share the A7 II generation's offset.
  { file: 'sony_nex7.arw', expectedCount: 9456, expectedModel: 'NEX-7' },
  { file: 'sony_nex6.arw', expectedCount: 12176, expectedModel: 'NEX-6' },
  { file: 'sony_nex5r.arw', expectedCount: 7076, expectedModel: 'NEX-5R' },
  { file: 'sony_nex3n.arw', expectedCount: 4540, expectedModel: 'NEX-3N' },
  { file: 'sony_slta77v.arw', expectedCount: 295, expectedModel: 'SLT-A77V' },
  { file: 'sony_slta58.arw', expectedCount: 29026, expectedModel: 'SLT-A58' },
  { file: 'sony_slta99v.arw', expectedCount: 9312, expectedModel: 'SLT-A99V' },
  { file: 'sony_ilca77m2.arw', expectedCount: 1621, expectedModel: 'ILCA-77M2' },
];

function toFile(path: string, name: string): File {
  const buf = readFileSync(path);
  return new File([buf], name);
}

describe('readShutterCount - Sony ARW', () => {
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
