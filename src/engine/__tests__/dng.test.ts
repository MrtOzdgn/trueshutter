import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { readShutterCount } from '../index';

describe('readShutterCount - DNG container', () => {
  it('correctly parses DNG as TIFF-based (container-level support), even for an unsupported brand', async () => {
    // Pentax/Ricoh isn't a supported brand, so this should — and does — report unsupported
    // rather than error. What this actually validates: DNG's container structure (magic bytes,
    // IFD0, ExifIFD) is parsed correctly end-to-end, since Make/Model come back right. A DNG
    // from a brand we do support (Nikon/Sony/Fujifilm) would flow through the exact same path.
    const buf = readFileSync('test-samples/pentax_k1.dng');
    const file = new File([buf], 'pentax_k1.dng');
    const result = await readShutterCount(file);

    expect(result.status).toBe('unsupported');
    if (result.status === 'unsupported') {
      expect(result.make).toContain('RICOH');
      expect(result.model?.trim()).toBe('PENTAX K-1');
      expect(result.format).toBe('DNG');
    }
  });
});
