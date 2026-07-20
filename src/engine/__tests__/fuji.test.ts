import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { readShutterCount } from '../index';

// Ground truth captured with `exiftool -Fujifilm:ImageCount`. Note the raw stored value has
// its high bit set as an unrelated flag — the documented fix is `value & 0x7FFF` (see
// makernote/fuji.ts) — so these fixtures also guard against a regression back to the raw,
// un-masked value.
const FIXTURES: Array<{ file: string; expectedCount: number; expectedModel: string }> = [
  { file: 'fuji_xt3.raf', expectedCount: 3850, expectedModel: 'X-T3' },
  { file: 'fuji_xh2.raf', expectedCount: 1515, expectedModel: 'X-H2' },
];

function toFile(path: string, name: string): File {
  const buf = readFileSync(path);
  return new File([buf], name);
}

describe('readShutterCount - Fujifilm RAF', () => {
  for (const fixture of FIXTURES) {
    it(`extracts the correct image count from ${fixture.file}`, async () => {
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
