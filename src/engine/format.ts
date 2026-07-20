import type { RawFormat } from './types';

/**
 * Identify container shape from magic bytes only. This tells us how to START parsing
 * (TIFF-based vs ISO-BMFF vs RAF's own magic) — it does NOT disambiguate brand/model,
 * which for TIFF-based files requires reading IFD0's Make/Model tags first.
 */
export type ContainerKind = 'tiff' | 'isobmff' | 'raf' | 'unknown';

export function detectContainer(view: DataView): ContainerKind {
  if (view.byteLength < 16) return 'unknown';

  const b0 = view.getUint8(0);
  const b1 = view.getUint8(1);
  if ((b0 === 0x49 && b1 === 0x49) || (b0 === 0x4d && b1 === 0x4d)) {
    return 'tiff';
  }

  // ISO-BMFF: 4-byte box size, then ASCII "ftyp"
  if (
    view.getUint8(4) === 0x66 &&
    view.getUint8(5) === 0x74 &&
    view.getUint8(6) === 0x79 &&
    view.getUint8(7) === 0x70
  ) {
    return 'isobmff';
  }

  // RAF: ASCII magic "FUJIFILMCCD-RAW"
  const magic = 'FUJIFILMCCD-RAW';
  let matches = true;
  for (let i = 0; i < magic.length; i++) {
    if (view.getUint8(i) !== magic.charCodeAt(i)) {
      matches = false;
      break;
    }
  }
  if (matches) return 'raf';

  return 'unknown';
}

/** Refine a RawFormat from file extension, used as a hint alongside container detection. */
export function formatFromExtension(filename: string): RawFormat {
  const ext = filename.split('.').pop()?.toUpperCase() ?? '';
  switch (ext) {
    case 'CR2':
    case 'CR3':
    case 'NEF':
    case 'ARW':
    case 'RAF':
    case 'ORF':
    case 'RW2':
    case 'DNG':
      return ext;
    case 'JPG':
    case 'JPEG':
      return 'JPEG';
    default:
      return 'UNKNOWN';
  }
}
