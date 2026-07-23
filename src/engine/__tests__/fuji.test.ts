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
  // Newer bodies, validated against raw.pixls.us samples — 9/9 matched.
  { file: 'fuji_xt4.raf', expectedCount: 239, expectedModel: 'X-T4' },
  { file: 'fuji_xt5.raf', expectedCount: 20, expectedModel: 'X-T5' },
  { file: 'fuji_xh2s.raf', expectedCount: 837, expectedModel: 'X-H2S' },
  { file: 'fuji_x100v.raf', expectedCount: 733, expectedModel: 'X100V' },
  { file: 'fuji_xe4.raf', expectedCount: 55, expectedModel: 'X-E4' },
  { file: 'fuji_xpro3.raf', expectedCount: 889, expectedModel: 'X-Pro3' },
  { file: 'fuji_gfx100s.raf', expectedCount: 73, expectedModel: 'GFX100S' },
  { file: 'fuji_gfx100ii.raf', expectedCount: 592, expectedModel: 'GFX100 II' },
  { file: 'fuji_gfx50sii.raf', expectedCount: 37, expectedModel: 'GFX50S II' },
  // Camera-scavenger leads, independently validated against raw.pixls.us samples — 3/3
  // matched their assumed same-family offset immediately.
  { file: 'fuji_gfx50s.raf', expectedCount: 395, expectedModel: 'GFX 50S' },
  { file: 'fuji_gfx50r.raf', expectedCount: 316, expectedModel: 'GFX 50R' },
  { file: 'fuji_gfx100.raf', expectedCount: 858, expectedModel: 'GFX 100' },
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
