// Fujifilm RAF container. Structure reimplemented from publicly documented reverse-engineering
// (e.g. libopenraw's RAF format notes): a 16-byte ASCII magic, then a fixed header holding the
// byte offset of an embedded JPEG preview. That JPEG carries a completely standard EXIF APP1
// segment, so once located we hand off to the same generic TIFF/IFD reader used everywhere else
// in this engine — no Fuji-specific metadata parsing needed beyond finding that offset.

const RAF_MAGIC = 'FUJIFILMCCD-RAW';
const JPEG_OFFSET_FIELD = 84; // big-endian uint32, byte position documented for the RAF directory

export function isRaf(view: DataView): boolean {
  if (view.byteLength < RAF_MAGIC.length) return false;
  for (let i = 0; i < RAF_MAGIC.length; i++) {
    if (view.getUint8(i) !== RAF_MAGIC.charCodeAt(i)) return false;
  }
  return true;
}

/**
 * Locate the start of the TIFF header (the "II"/"MM" marker) inside the embedded JPEG's EXIF
 * APP1 segment, by walking standard JPEG markers from the JPEG offset given in the RAF header.
 */
export function findEmbeddedTiffBase(view: DataView): number | null {
  const jpegOffset = view.getUint32(JPEG_OFFSET_FIELD, false);
  if (jpegOffset + 4 > view.byteLength) return null;
  if (view.getUint8(jpegOffset) !== 0xff || view.getUint8(jpegOffset + 1) !== 0xd8) return null; // expect SOI

  let pos = jpegOffset + 2;
  while (pos + 4 <= view.byteLength) {
    if (view.getUint8(pos) !== 0xff) return null; // not a marker, malformed
    const marker = view.getUint8(pos + 1);
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      pos += 2; // markers with no length field
      continue;
    }
    const segmentLength = view.getUint16(pos + 2, false);
    if (marker === 0xe1) {
      // APP1 — check for the 6-byte "Exif\0\0" identifier right after the length field
      const idStart = pos + 4;
      if (readAscii(view, idStart, 4) === 'Exif' && view.getUint8(idStart + 4) === 0 && view.getUint8(idStart + 5) === 0) {
        return idStart + 6;
      }
    }
    if (marker === 0xda) return null; // start of scan — no more marker segments after this
    pos += 2 + segmentLength;
  }
  return null;
}

function readAscii(view: DataView, offset: number, length: number): string {
  let out = '';
  for (let i = 0; i < length; i++) out += String.fromCharCode(view.getUint8(offset + i));
  return out;
}
