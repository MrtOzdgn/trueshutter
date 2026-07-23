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
  // Newer generations, validated against raw.pixls.us samples — 13/14 matched immediately;
  // the one miss (A7 IV) simply wasn't in our model-matching table yet, fixed below.
  { file: 'sony_a1.arw', expectedCount: 1173, expectedModel: 'ILCE-1' },
  { file: 'sony_a6100.arw', expectedCount: 156, expectedModel: 'ILCE-6100' },
  { file: 'sony_a6300.arw', expectedCount: 2146, expectedModel: 'ILCE-6300' },
  { file: 'sony_a6400.arw', expectedCount: 118, expectedModel: 'ILCE-6400' },
  { file: 'sony_a6600.arw', expectedCount: 538, expectedModel: 'ILCE-6600' },
  { file: 'sony_a7rm3.arw', expectedCount: 15864, expectedModel: 'ILCE-7RM3' },
  { file: 'sony_a7rm4.arw', expectedCount: 33, expectedModel: 'ILCE-7RM4' },
  { file: 'sony_a7m3.arw', expectedCount: 73, expectedModel: 'ILCE-7M3' },
  { file: 'sony_a9.arw', expectedCount: 942, expectedModel: 'ILCE-9' },
  { file: 'sony_a9m2.arw', expectedCount: 26, expectedModel: 'ILCE-9M2' },
  { file: 'sony_zve10.arw', expectedCount: 3, expectedModel: 'ZV-E10' },
  // Newest generation (0x000A offset) — both matched, upgrading that group from
  // documented-only to genuinely confirmed.
  { file: 'sony_a6700.arw', expectedCount: 2, expectedModel: 'ILCE-6700' },
  { file: 'sony_a7cr.arw', expectedCount: 811, expectedModel: 'ILCE-7CR' },
  // A7 IV wasn't in the matcher table at all until this batch — two independent files
  // (different counts) confirmed it shares the 0x003A offset with its siblings.
  { file: 'sony_a7m4.arw', expectedCount: 16903, expectedModel: 'ILCE-7M4' },
  { file: 'sony_a7m4_2.arw', expectedCount: 16907, expectedModel: 'ILCE-7M4' },
  // Gap-fill against shuttercount.app's coverage — same 0x003A offset, confirmed on 3 more.
  { file: 'sony_a7c.arw', expectedCount: 19, expectedModel: 'ILCE-7C' },
  { file: 'sony_a7rm5.arw', expectedCount: 446, expectedModel: 'ILCE-7RM5' },
  { file: 'sony_a7sm3.arw', expectedCount: 5460, expectedModel: 'ILCE-7SM3' },
  // Camera-scavenger leads, independently validated against raw.pixls.us samples. A7R matched
  // its assumed 0x0032 offset immediately; A7S II did NOT match the same assumption (naively
  // grouped with A7S) — cross-checking against exiftool caught it returning 0 instead of the
  // real count, and scanning the deciphered block for the known-correct value found it actually
  // belongs in the 0x003A generation instead. A6500 matched its assumed 0x003A offset.
  { file: 'sony_a7r.arw', expectedCount: 7648, expectedModel: 'ILCE-7R' },
  { file: 'sony_a7sii.arw', expectedCount: 666, expectedModel: 'ILCE-7SM2' },
  { file: 'sony_a6500.arw', expectedCount: 3233, expectedModel: 'ILCE-6500' },
  // Second batch of scavenger leads. A7C II matched its assumed 0x000A offset; NEX-5N matched
  // its assumed 0x0032 offset. NEX-C3 and ZV-E1 do NOT carry MakerNote tag 0x9050 at all (see
  // the unsupported describe block below) despite exiftool reporting NEX-C3's count via some
  // other tag — not the same mechanism, not implemented here.
  { file: 'sony_a7c2.arw', expectedCount: 31, expectedModel: 'ILCE-7CM2' },
  { file: 'sony_nex5n.arw', expectedCount: 3262, expectedModel: 'NEX-5N' },
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

describe('readShutterCount - Sony ARW (no MakerNote tag 0x9050, correctly unsupported)', () => {
  // Two more camera-scavenger leads assumed these shared a same-generation offset. Neither
  // actually carries the encrypted tag 0x9050 at all — NEX-C3 predates it (exiftool reads its
  // count from a different, unimplemented tag) and ZV-E1 has no ShutterCount in exiftool
  // either. These guard against a regression that would make either silently misreport.
  const UNSUPPORTED_FIXTURES = ['sony_nexc3.arw', 'sony_zve1.arw'];

  for (const file of UNSUPPORTED_FIXTURES) {
    it(`reports ${file} as unsupported rather than a wrong count`, async () => {
      const result = await readShutterCount(toFile(`test-samples/${file}`, file));
      expect(result.status).toBe('unsupported');
    });
  }
});
