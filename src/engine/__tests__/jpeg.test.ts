import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { readShutterCount } from '../index';

// These fixtures are synthesized (real MakerNote bytes, byte-accurate copied via `exiftool
// -TagsFromFile` from an already-validated RAW fixture, onto a real JPEG's image data) rather
// than genuine camera JPEGs. That's deliberate: real-world camera JPEGs frequently strip
// MakerNote data (tested directly — several RAW files' own embedded preview/JpgFromRaw variants
// already omit ShutterCount even though the RAW has it), so a "real" downloaded JPEG sample
// isn't actually a reliable way to validate the parsing logic. What we're testing here is
// whether this engine correctly walks JPEG's standard marker-segment structure to find the
// EXIF APP1 block and hands off to the same TIFF reader used everywhere else — using a real,
// specification-accurate byte layout, not fabricated data.
const FIXTURES: Array<{ file: string; expectedCount: number; expectedModel: string }> = [
  { file: 'test_jpeg_synthetic.jpg', expectedCount: 676, expectedModel: 'NIKON D40' },
  { file: 'test_jpeg_sony.jpg', expectedCount: 998, expectedModel: 'ILCE-7M2' },
  { file: 'test_jpeg_fuji.jpg', expectedCount: 3850, expectedModel: 'X-T3' },
];

function toFile(path: string, name: string): File {
  const buf = readFileSync(path);
  return new File([buf], name);
}

describe('readShutterCount - JPEG container', () => {
  for (const fixture of FIXTURES) {
    it(`extracts the correct shutter count from ${fixture.file}`, async () => {
      const file = toFile(`test-samples/${fixture.file}`, fixture.file);
      const result = await readShutterCount(file);

      expect(result.status).toBe('ok');
      if (result.status === 'ok') {
        expect(result.shutterCount).toBe(fixture.expectedCount);
        expect(result.model.trim()).toBe(fixture.expectedModel);
        expect(result.format).toBe('JPEG');
      }
    });
  }

  it('reports edited/stripped JPEGs as unsupported rather than crashing', async () => {
    // The real downloaded exif-samples D70 JPEG had been re-saved through GIMP, which stripped
    // its MakerNote — a genuine real-world case, not a synthesized one.
    const file = toFile('test-samples/test_jpeg_edited.jpg', 'test_jpeg_edited.jpg');
    const result = await readShutterCount(file);
    expect(result.status).toBe('unsupported');
  });
});
