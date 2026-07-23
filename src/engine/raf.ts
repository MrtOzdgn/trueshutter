// Fujifilm RAF container. Structure reimplemented from publicly documented reverse-engineering
// (e.g. libopenraw's RAF format notes): a 16-byte ASCII magic, then a fixed header holding the
// byte offset of an embedded JPEG preview. That JPEG carries a completely standard EXIF APP1
// segment, so once located we hand off to the same generic TIFF/IFD reader used everywhere else
// in this engine — no Fuji-specific metadata parsing needed beyond finding that offset.

import { findExifTiffBase } from './jpegMarkers';

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
 * Locate the start of the TIFF header inside RAF's embedded JPEG preview, by walking standard
 * JPEG markers from the JPEG offset given in the RAF header.
 */
export function findEmbeddedTiffBase(view: DataView): number | null {
  const jpegOffset = view.getUint32(JPEG_OFFSET_FIELD, false);
  return findExifTiffBase(view, jpegOffset);
}
