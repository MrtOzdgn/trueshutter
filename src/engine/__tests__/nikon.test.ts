import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { readShutterCount } from '../index';

// Ground truth for each fixture was captured with `exiftool -ShutterCount`, not hand-typed —
// see test-samples/README for the exact command run against each file.
const FIXTURES: Array<{ file: string; expectedCount: number; expectedModel: string }> = [
  { file: 'nikon_d40.nef', expectedCount: 676, expectedModel: 'NIKON D40' },
  { file: 'nikon_d5300.nef', expectedCount: 2148, expectedModel: 'NIKON D5300' },
  { file: 'nikon_d3.nef', expectedCount: 14744, expectedModel: 'NIKON D3' },
  // Found by batch-validating this engine against the full rawsamples.ch Nikon catalog — every
  // one of these matched cleanly, which is strong evidence tag 0x00A7 really is universal
  // across Nikon's lineup rather than something we got lucky with on 3 bodies.
  { file: 'nikon_1v1.nef', expectedCount: 244, expectedModel: 'NIKON 1 V1' },
  { file: 'nikon_1s2.nef', expectedCount: 67, expectedModel: 'NIKON 1 S2' },
  { file: 'nikon_d200.nef', expectedCount: 160, expectedModel: 'NIKON D200' },
  { file: 'nikon_d2x.nef', expectedCount: 79, expectedModel: 'NIKON D2X' },
  { file: 'nikon_d300.nef', expectedCount: 817, expectedModel: 'NIKON D300' },
  { file: 'nikon_d300s.nef', expectedCount: 170, expectedModel: 'NIKON D300S' },
  { file: 'nikon_d3100.nef', expectedCount: 19637, expectedModel: 'NIKON D3100' },
  { file: 'nikon_d3200.nef', expectedCount: 1267, expectedModel: 'NIKON D3200' },
  { file: 'nikon_d3300.nef', expectedCount: 699, expectedModel: 'NIKON D3300' },
  { file: 'nikon_d3x.nef', expectedCount: 47, expectedModel: 'NIKON D3X' },
  { file: 'nikon_d50.nef', expectedCount: 2846, expectedModel: 'NIKON D50' },
  { file: 'nikon_d5000.nef', expectedCount: 479, expectedModel: 'NIKON D5000' },
  { file: 'nikon_d5100.nef', expectedCount: 112, expectedModel: 'NIKON D5100' },
  { file: 'nikon_d5200.nef', expectedCount: 3405, expectedModel: 'NIKON D5200' },
  { file: 'nikon_d60.nef', expectedCount: 1121, expectedModel: 'NIKON D60' },
  { file: 'nikon_d600.nef', expectedCount: 20117, expectedModel: 'NIKON D600' },
  { file: 'nikon_d7000.nef', expectedCount: 85, expectedModel: 'NIKON D7000' },
  { file: 'nikon_d70s.nef', expectedCount: 10342, expectedModel: 'NIKON D70s' },
  { file: 'nikon_d7100.nef', expectedCount: 205, expectedModel: 'NIKON D7100' },
  { file: 'nikon_d750.nef', expectedCount: 478, expectedModel: 'NIKON D750' },
  { file: 'nikon_d800.nef', expectedCount: 8827, expectedModel: 'NIKON D800' },
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
