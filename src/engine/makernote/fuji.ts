/**
 * Fujifilm's MakerNote (found via the standard ExifIFD tag 0x927C, same as any brand) has its
 * own small header rather than Nikon's nested TIFF header: 8-byte ASCII signature "FUJIFILM",
 * then a 4-byte little-endian offset to its IFD, relative to the MakerNote's own start — no
 * separate byte-order marker, it just continues in the outer file's endianness.
 *
 * ImageCount lives at tag 0x1438 (publicly documented, e.g. exiv2's Fujifilm tag reference).
 * Its raw stored value has the high bit set as a flag unrelated to the count itself; the
 * documented fix is `value & 0x7FFF` to isolate the actual count — reimplemented here as a
 * plain bitmask fact, not any copied conversion code.
 */

const SIGNATURE = 'FUJIFILM';
const TAG_IMAGE_COUNT = 0x1438;

export function readFujiShutterCount(view: DataView, makerNoteOffset: number, littleEndian: boolean): number | null {
  const signature = readAscii(view, makerNoteOffset, SIGNATURE.length);
  if (signature !== SIGNATURE) return null;

  const ifdRelOffset = view.getUint32(makerNoteOffset + 8, littleEndian);
  const ifdOffset = makerNoteOffset + ifdRelOffset;
  const entryCount = view.getUint16(ifdOffset, littleEndian);

  for (let i = 0; i < entryCount; i++) {
    const entryOffset = ifdOffset + 2 + i * 12;
    const tag = view.getUint16(entryOffset, littleEndian);
    if (tag !== TAG_IMAGE_COUNT) continue;

    const rawValue = view.getUint16(entryOffset + 8, littleEndian);
    return rawValue & 0x7fff;
  }
  return null;
}

function readAscii(view: DataView, offset: number, length: number): string {
  let out = '';
  for (let i = 0; i < length; i++) out += String.fromCharCode(view.getUint8(offset + i));
  return out;
}
