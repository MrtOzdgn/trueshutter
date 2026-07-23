// Standalone JPEG files. If a camera's straight-out-of-camera JPEG still carries its original
// EXIF APP1 segment (with the same MakerNote structure as the RAW), we can read it the exact
// same way. In practice this only works for untouched, unedited files — any editor or resave
// typically strips MakerNote data, since it isn't meaningful after the image has been processed.

import { findExifTiffBase } from './jpegMarkers';

export function isJpeg(view: DataView): boolean {
  return view.byteLength >= 3 && view.getUint8(0) === 0xff && view.getUint8(1) === 0xd8 && view.getUint8(2) === 0xff;
}

/** JPEG's own SOI marker is always at the very start of the file. */
export function findEmbeddedTiffBase(view: DataView): number | null {
  return findExifTiffBase(view, 0);
}
