// Minimal, dependency-free TIFF/IFD reader. TIFF is the container format shared by
// NEF, ARW, CR2, ORF, RW2 and DNG. Reimplemented from the publicly documented TIFF 6.0
// spec and publicly documented MakerNote tag layouts (e.g. exiv2's tag reference) —
// no code ported from any GPL/Artistic-licensed tool.

export interface TiffHeader {
  /** true = little-endian ("II"), false = big-endian ("MM") */
  littleEndian: boolean;
  /** Absolute file offset of IFD0, resolved from the header's relative offset. */
  ifd0Offset: number;
}

export interface IfdEntry {
  tag: number;
  type: number;
  count: number;
  /** Raw 4-byte value/offset field as stored in the entry, unresolved. */
  rawValueOrOffset: number;
  /** Absolute file offset of this entry's 12-byte record. */
  entryOffset: number;
}

export interface Ifd {
  entries: Map<number, IfdEntry>;
  nextIfdOffset: number;
}

/** Byte size of one element for each TIFF field type. Type 0 / unknown types default to 1. */
const TYPE_SIZES: Record<number, number> = {
  1: 1, // BYTE
  2: 1, // ASCII
  3: 2, // SHORT
  4: 4, // LONG
  5: 8, // RATIONAL
  6: 1, // SBYTE
  7: 1, // UNDEFINED
  8: 2, // SSHORT
  9: 4, // SLONG
  10: 8, // SRATIONAL
  11: 4, // FLOAT
  12: 8, // DOUBLE
};

export function typeSize(type: number): number {
  return TYPE_SIZES[type] ?? 1;
}

/**
 * Read a TIFF header at absolute offset `base`. `base` is the byte offset of the "II"/"MM"
 * marker itself — for a top-level TIFF-based RAW file that's 0; for a MakerNote carrying its
 * own embedded TIFF header (e.g. Nikon), it's wherever that embedded header starts in the file.
 */
export function readTiffHeader(view: DataView, base: number): TiffHeader {
  const b0 = view.getUint8(base);
  const b1 = view.getUint8(base + 1);
  let littleEndian: boolean;
  if (b0 === 0x49 && b1 === 0x49) littleEndian = true;
  else if (b0 === 0x4d && b1 === 0x4d) littleEndian = false;
  else throw new Error(`Not a TIFF header at offset ${base}`);

  const magic = view.getUint16(base + 2, littleEndian);
  if (magic !== 42) throw new Error(`Invalid TIFF magic number at offset ${base}: ${magic}`);

  const relativeIfd0Offset = view.getUint32(base + 4, littleEndian);
  return { littleEndian, ifd0Offset: base + relativeIfd0Offset };
}

/**
 * Read one IFD (Image File Directory). `base` is the TIFF header's base offset — the point
 * that all offset-type entry values in this IFD are relative to. `ifdOffset` is the absolute
 * file offset of the IFD's entry-count field.
 */
export function readIfd(view: DataView, base: number, ifdOffset: number, littleEndian: boolean): Ifd {
  const entryCount = view.getUint16(ifdOffset, littleEndian);
  const entries = new Map<number, IfdEntry>();

  for (let i = 0; i < entryCount; i++) {
    const entryOffset = ifdOffset + 2 + i * 12;
    const tag = view.getUint16(entryOffset, littleEndian);
    const type = view.getUint16(entryOffset + 2, littleEndian);
    const count = view.getUint32(entryOffset + 4, littleEndian);
    const rawValueOrOffset = view.getUint32(entryOffset + 8, littleEndian);
    entries.set(tag, { tag, type, count, rawValueOrOffset, entryOffset });
  }

  const nextIfdOffset = view.getUint32(ifdOffset + 2 + entryCount * 12, littleEndian);
  return { entries, nextIfdOffset };
}

/**
 * Resolve the absolute file offset where an entry's actual value bytes live: inline within
 * the 12-byte entry record if they fit in 4 bytes, otherwise at `base + rawValueOrOffset`.
 */
export function entryValueOffset(entry: IfdEntry, base: number): number {
  const totalSize = typeSize(entry.type) * entry.count;
  if (totalSize <= 4) {
    return entry.entryOffset + 8;
  }
  return base + entry.rawValueOrOffset;
}

export function readEntryAsUint32(view: DataView, entry: IfdEntry, base: number, littleEndian: boolean): number {
  return view.getUint32(entryValueOffset(entry, base), littleEndian);
}

export function readEntryAsUint16(view: DataView, entry: IfdEntry, base: number, littleEndian: boolean): number {
  return view.getUint16(entryValueOffset(entry, base), littleEndian);
}

export function readEntryAsAscii(view: DataView, entry: IfdEntry, base: number): string {
  const offset = entryValueOffset(entry, base);
  const bytes: number[] = [];
  for (let i = 0; i < entry.count; i++) {
    const b = view.getUint8(offset + i);
    if (b === 0) break;
    bytes.push(b);
  }
  return String.fromCharCode(...bytes).trim();
}

/** Standard IFD0 tags used to identify the camera before dispatching to a brand-specific reader. */
export const TAG_MAKE = 0x010f;
export const TAG_MODEL = 0x0110;
export const TAG_EXIF_IFD_POINTER = 0x8769;
export const TAG_MAKER_NOTE = 0x927c;
