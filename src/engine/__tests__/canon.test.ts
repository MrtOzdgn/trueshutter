import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { readShutterCount } from '../index';

// Ground truth captured with `exiftool -ShutterCount`. R5/R6 verified on 3 independent files
// across 2 models with different counts (see makernote/canon.ts for the full investigation:
// an earlier CMT3-based approach looked right on one file but failed a second independent
// check, which is exactly why every entry here is cross-checked against a real file rather
// than trusted from a single match).
const FIXTURES: Array<{ file: string; expectedCount: number; expectedModel: string }> = [
  { file: 'canon_r6.cr3', expectedCount: 298, expectedModel: 'Canon EOS R6' },
  { file: 'canon_r6_craw.cr3', expectedCount: 331, expectedModel: 'Canon EOS R6' },
  { file: 'canon_r5.cr3', expectedCount: 2132, expectedModel: 'Canon EOS R5' },
  // Same second-gen offset (3369) as R6 Mark II — cross-checked on 4 more files across 2
  // models, which is what promoted the whole group from single-sample to confirmed.
  { file: 'canon_r8_1.cr3', expectedCount: 63, expectedModel: 'Canon EOS R8' },
  { file: 'canon_r8_2.cr3', expectedCount: 65, expectedModel: 'Canon EOS R8' },
  { file: 'canon_r50_1.cr3', expectedCount: 43, expectedModel: 'Canon EOS R50' },
  { file: 'canon_r50_2.cr3', expectedCount: 20, expectedModel: 'Canon EOS R50' },
  // Third-generation offset (2157 / 0x086D) — matches what a competitor documents, but found
  // independently here and cross-checked on 2 files with different counts before trusting it.
  { file: 'canon_r6m3_1.cr3', expectedCount: 4241, expectedModel: 'Canon EOS R6 Mark III' },
  { file: 'canon_r6m3_2.cr3', expectedCount: 4242, expectedModel: 'Canon EOS R6 Mark III' },
];

function toFile(path: string, name: string): File {
  const buf = readFileSync(path);
  return new File([buf], name);
}

describe('readShutterCount - Canon CR3', () => {
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

  // Only one R6 Mark II sample file exists in our fixtures, but the offset it uses (3369) is
  // the same one independently confirmed by the 4 R8/R50 fixtures above, so this is trusted.
  it('extracts the shutter count from an EOS R6 Mark II file', async () => {
    const file = toFile('test-samples/canon_r6m2.cr3', 'canon_r6m2.cr3');
    const result = await readShutterCount(file);
    expect(result.status).toBe('ok');
    if (result.status === 'ok') {
      expect(result.shutterCount).toBe(259);
    }
  });
});

describe('readShutterCount - Canon CR2 (1D-series pro bodies)', () => {
  // CR2 is a genuinely different, TIFF-based container (not CR3's ISOBMFF). Consumer/prosumer
  // CR2 bodies don't store shutter count in-file at all; the professional 1D-series does, in a
  // documented MakerNote tag (0x0093 "FileInfo"). Verified on 2 models with different counts.
  const CR2_FIXTURES: Array<{ file: string; expectedCount: number; expectedModel: string }> = [
    { file: 'canon_1d2.cr2', expectedCount: 14070, expectedModel: 'Canon EOS-1D Mark II' },
    { file: 'canon_1ds2.cr2', expectedCount: 72, expectedModel: 'Canon EOS-1Ds Mark II' },
  ];

  for (const fixture of CR2_FIXTURES) {
    it(`extracts the correct shutter count from ${fixture.file}`, async () => {
      const file = toFile(`test-samples/${fixture.file}`, fixture.file);
      const result = await readShutterCount(file);

      expect(result.status).toBe('ok');
      if (result.status === 'ok') {
        expect(result.shutterCount).toBe(fixture.expectedCount);
        expect(result.model.trim()).toBe(fixture.expectedModel);
        expect(result.format).toBe('CR2');
      }
    });
  }
});

describe('readShutterCount - Canon CR3 (original EOS R, correctly unsupported)', () => {
  // A camera-scavenger lead for the original EOS R turned out to have no exiftool
  // ShutterCount ground truth to validate against at all, unlike R5/R6/R6 II — this guards
  // against a regression that would make the engine silently report a wrong count for it.
  it('reports canon_eosr.cr3 as unsupported rather than a wrong count', async () => {
    const file = toFile('test-samples/canon_eosr.cr3', 'canon_eosr.cr3');
    const result = await readShutterCount(file);
    expect(result.status).toBe('unsupported');
  });
});
