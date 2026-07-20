import { readTiffHeader, readIfd, readEntryAsUint32 } from '../binary';

/** Publicly documented (e.g. exiv2 Nikon tag reference): ShutterCount lives at MakerNote tag 0x00A7. */
const TAG_SHUTTER_COUNT = 0x00a7;

/**
 * Nikon "Type 3" MakerNote layout (used by essentially all Nikon bodies since the D40):
 *   bytes 0..5   ASCII "Nikon\0"
 *   bytes 6..7   version (e.g. 02 10)
 *   bytes 8..9   unknown/reserved
 *   byte 10..    a fresh embedded TIFF header, self-contained — its own byte order marker
 *                and its own IFD0, with all of ITS offsets relative to byte 10, not to the
 *                start of the outer file.
 *
 * `makerNoteOffset` is the absolute file offset where the MakerNote data begins.
 */
export function readNikonShutterCount(view: DataView, makerNoteOffset: number): number | null {
  const signature = readAscii(view, makerNoteOffset, 6);
  if (signature !== 'Nikon\0') return null;

  const embeddedHeaderBase = makerNoteOffset + 10;
  const header = readTiffHeader(view, embeddedHeaderBase);
  const ifd0 = readIfd(view, embeddedHeaderBase, header.ifd0Offset, header.littleEndian);

  const entry = ifd0.entries.get(TAG_SHUTTER_COUNT);
  if (!entry) return null;

  return readEntryAsUint32(view, entry, embeddedHeaderBase, header.littleEndian);
}

function readAscii(view: DataView, offset: number, length: number): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += String.fromCharCode(view.getUint8(offset + i));
  }
  return out;
}
