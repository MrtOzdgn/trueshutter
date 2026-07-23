import { walkBoxes, findBox, findUuidBox, findTrackSample, CANON_UUID, type Box } from '../isobmff';
import {
  readTiffHeader,
  readIfd,
  readEntryAsAscii,
  entryValueOffset,
  TAG_MAKE,
  TAG_MODEL,
  TAG_DATE_TIME_ORIGINAL,
} from '../binary';

/**
 * Canon CR3 is ISO-BMFF. Static camera metadata (Make/Model) lives in a proprietary `uuid`
 * box nested inside `moov`, containing boxes CMT1-CMT4 — each a complete embedded TIFF
 * structure (CMT1=IFD0, CMT2=ExifIFD, CMT3=Canon MakerNotes, CMT4=GPS). Box layout
 * reimplemented from the publicly documented reverse-engineering at
 * github.com/lclevy/canon_cr3; the `trak`/`mdia`/`minf`/`stbl` sample-table walk used to
 * locate the CTMD track is plain ISO/IEC 14496-12, not Canon-specific.
 *
 * Shutter count is NOT reliably in CMT3's static snapshot (verified empirically: it can hold
 * a stale value shared across frames from the same shoot). The live value is in the `CTMD`
 * metadata track instead — a per-frame record stream in `mdat`. Within it, a "type 8" record
 * holds its own embedded TIFF (Canon MakerNotes-equivalent), and shutter count sits at a
 * fixed byte index inside opaque MakerNote tag 0x000D there.
 *
 * Index verified against exiftool on two independent EOS R6 files (different counts, both
 * matched) and one EOS R5 file. EOS R6 Mark II uses a different index, confirmed on only one
 * sample so far — flagged `confirmed: false` until cross-checked against a second file.
 */

const TAG_SHUTTER_BLOCK = 0x000d;

interface IndexRule {
  matcher: RegExp;
  byteIndex: number;
  confirmed: boolean;
}

const INDEX_RULES: IndexRule[] = [
  { matcher: /^Canon EOS R5$|^Canon EOS R6$/, byteIndex: 2801, confirmed: true },
  { matcher: /^Canon EOS R6m2$|^Canon EOS R6 Mark II$/, byteIndex: 3369, confirmed: false },
];

interface CanonResult {
  make: string;
  model: string;
  shutterCount: number | null;
  dateTaken: string | null;
}

export function readCanonCr3(view: DataView): CanonResult | null {
  const top = walkBoxes(view, 0, view.byteLength);
  const moov = findBox(top, 'moov');
  if (!moov) return null;

  const moovChildren = walkBoxes(view, moov.payloadStart, moov.end);

  const canonBox = findUuidBox(view, moovChildren, CANON_UUID);
  const { make, model, dateTaken } = canonBox
    ? readMakeModelDate(view, canonBox)
    : { make: '', model: '', dateTaken: null };

  const shutterCount = readShutterCountFromCtmd(view, moovChildren, model);

  return { make, model, shutterCount, dateTaken };
}

function readMakeModelDate(view: DataView, canonBox: Box): { make: string; model: string; dateTaken: string | null } {
  const canonChildren = walkBoxes(view, canonBox.payloadStart + 16, canonBox.end);
  const cmt1 = findBox(canonChildren, 'CMT1');
  if (!cmt1) return { make: '', model: '', dateTaken: null };

  const header = readTiffHeader(view, cmt1.payloadStart);
  const ifd0 = readIfd(view, cmt1.payloadStart, header.ifd0Offset, header.littleEndian);

  const makeEntry = ifd0.entries.get(TAG_MAKE);
  const modelEntry = ifd0.entries.get(TAG_MODEL);
  const make = makeEntry ? readEntryAsAscii(view, makeEntry, cmt1.payloadStart) : '';
  const model = modelEntry ? readEntryAsAscii(view, modelEntry, cmt1.payloadStart) : '';

  // CMT2 is the ExifIFD-equivalent embedded TIFF block, holding standard tags like capture date.
  let dateTaken: string | null = null;
  const cmt2 = findBox(canonChildren, 'CMT2');
  if (cmt2) {
    const exifHeader = readTiffHeader(view, cmt2.payloadStart);
    const exifIfd = readIfd(view, cmt2.payloadStart, exifHeader.ifd0Offset, exifHeader.littleEndian);
    const dateEntry = exifIfd.entries.get(TAG_DATE_TIME_ORIGINAL);
    if (dateEntry) dateTaken = readEntryAsAscii(view, dateEntry, cmt2.payloadStart);
  }

  return { make, model, dateTaken };
}

function readShutterCountFromCtmd(view: DataView, moovChildren: Box[], model: string): number | null {
  const rule = INDEX_RULES.find((r) => r.matcher.test(model.trim()));
  if (!rule) return null;

  const sample = findTrackSample(view, moovChildren, 'CTMD');
  if (!sample) return null;

  const tiff = findType8EmbeddedTiff(view, sample.offset, sample.size);
  if (!tiff) return null;

  const ifd0Offset = tiff.tiffBase + view.getUint32(tiff.tiffBase + 4, tiff.littleEndian);
  const count = view.getUint16(ifd0Offset, tiff.littleEndian);
  for (let i = 0; i < count; i++) {
    const entryOffset = ifd0Offset + 2 + i * 12;
    const tag = view.getUint16(entryOffset, tiff.littleEndian);
    if (tag !== TAG_SHUTTER_BLOCK) continue;

    const rawValueOrOffset = view.getUint32(entryOffset + 8, tiff.littleEndian);
    const blockOffset = tiff.tiffBase + rawValueOrOffset;
    const pos = blockOffset + rule.byteIndex;
    if (pos + 2 > view.byteLength) return null;
    return view.getUint16(pos, tiff.littleEndian);
  }
  return null;
}

/**
 * CTMD is a stream of records in the pattern: 4-byte size (little-endian, includes this
 * header), 2-byte record type, 2-byte flag, 4-byte reserved, then payload. A "type 8" record's
 * payload starts with a short proprietary preamble before its own embedded TIFF header.
 */
function findType8EmbeddedTiff(
  view: DataView,
  sampleOffset: number,
  sampleSize: number,
): { tiffBase: number; littleEndian: boolean } | null {
  let pos = sampleOffset;
  const end = sampleOffset + sampleSize;

  while (pos + 12 <= end) {
    const size = view.getUint32(pos, true);
    const recordType = view.getUint16(pos + 4, true);
    if (size < 12 || pos + size > end) break;

    if (recordType === 8) {
      const payloadStart = pos + 12;
      for (let offset = 0; offset < 16; offset++) {
        const candidate = payloadStart + offset;
        const b0 = view.getUint8(candidate);
        const b1 = view.getUint8(candidate + 1);
        const littleEndian = b0 === 0x49 && b1 === 0x49;
        const bigEndian = b0 === 0x4d && b1 === 0x4d;
        if (littleEndian || bigEndian) {
          if (view.getUint16(candidate + 2, littleEndian) === 42) {
            return { tiffBase: candidate, littleEndian };
          }
        }
      }
    }
    pos += size;
  }
  return null;
}
