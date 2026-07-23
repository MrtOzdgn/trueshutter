// Shared JPEG marker-segment walker. Standard JPEG/JFIF structure (ISO/IEC 10918-1) — used both
// for standalone .jpg files and for the embedded JPEG previews inside RAF/other containers that
// carry their real EXIF/MakerNote data in a completely ordinary APP1 "Exif\0\0" segment.

/**
 * Starting from a JPEG SOI marker at `jpegStartOffset`, walk marker segments to find the EXIF
 * APP1 segment and return the absolute offset of the TIFF header (the "II"/"MM" marker) inside
 * it. Returns null if this isn't a valid JPEG at that offset or it carries no EXIF APP1 segment.
 */
export function findExifTiffBase(view: DataView, jpegStartOffset: number): number | null {
  if (jpegStartOffset + 4 > view.byteLength) return null;
  if (view.getUint8(jpegStartOffset) !== 0xff || view.getUint8(jpegStartOffset + 1) !== 0xd8) return null; // expect SOI

  let pos = jpegStartOffset + 2;
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
