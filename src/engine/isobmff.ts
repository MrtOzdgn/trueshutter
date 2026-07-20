// Minimal ISO-BMFF (ISO/IEC 14496-12) box walker — the container format CR3 is built on.
// Structure and Canon-specific box layout (the proprietary UUID box holding CMT1-CMT4)
// reimplemented from the publicly documented reverse-engineering at
// https://github.com/lclevy/canon_cr3 — facts about the format, not copied code.

export interface Box {
  type: string;
  /** Absolute file offset where this box's 4-byte-size+fourcc header starts. */
  start: number;
  /** Absolute file offset where this box's payload (content after the header) starts. */
  payloadStart: number;
  /** Absolute file offset one past the end of this box. */
  end: number;
}

function fourcc(view: DataView, offset: number): string {
  return String.fromCharCode(
    view.getUint8(offset),
    view.getUint8(offset + 1),
    view.getUint8(offset + 2),
    view.getUint8(offset + 3),
  );
}

/** Walk sibling boxes in [start, end). Does not recurse — call again on a box's payload range. */
export function walkBoxes(view: DataView, start: number, end: number): Box[] {
  const boxes: Box[] = [];
  let pos = start;
  while (pos + 8 <= end) {
    let size = view.getUint32(pos, false);
    const type = fourcc(view, pos + 4);
    let headerSize = 8;
    if (size === 1) {
      if (pos + 16 > end) break;
      const hi = view.getUint32(pos + 8, false);
      const lo = view.getUint32(pos + 12, false);
      size = hi * 2 ** 32 + lo;
      headerSize = 16;
    }
    if (size < 8 || pos + size > end) break;
    boxes.push({ type, start: pos, payloadStart: pos + headerSize, end: pos + size });
    pos += size;
  }
  return boxes;
}

export function findBox(boxes: Box[], type: string): Box | undefined {
  return boxes.find((b) => b.type === type);
}

function uuidHex(view: DataView, offset: number): string {
  let s = '';
  for (let i = 0; i < 16; i++) s += view.getUint8(offset + i).toString(16).padStart(2, '0');
  return s;
}

/** Canon's proprietary metadata container, nested as a `uuid` box inside `moov`. */
export const CANON_UUID = '85c0b687820f11e08111f4ce462b6a48';

export function findUuidBox(view: DataView, boxes: Box[], uuidHexId: string): Box | undefined {
  for (const box of boxes) {
    if (box.type === 'uuid' && uuidHex(view, box.payloadStart) === uuidHexId) return box;
  }
  return undefined;
}

export interface SampleLocation {
  offset: number;
  size: number;
}

/**
 * Find the single sample's absolute file offset and byte size for a `trak` whose sample
 * description (`stsd`) entry fourCC matches `sampleEntryType` — e.g. Canon's `CTMD` metadata
 * track. Assumes one chunk / one sample per track, true for CTMD in CR3 files.
 */
export function findTrackSample(view: DataView, moovChildren: Box[], sampleEntryType: string): SampleLocation | undefined {
  for (const trak of moovChildren) {
    if (trak.type !== 'trak') continue;
    const trakChildren = walkBoxes(view, trak.payloadStart, trak.end);
    const mdia = findBox(trakChildren, 'mdia');
    if (!mdia) continue;
    const mdiaChildren = walkBoxes(view, mdia.payloadStart, mdia.end);
    const minf = findBox(mdiaChildren, 'minf');
    if (!minf) continue;
    const minfChildren = walkBoxes(view, minf.payloadStart, minf.end);
    const stbl = findBox(minfChildren, 'stbl');
    if (!stbl) continue;
    const stblChildren = walkBoxes(view, stbl.payloadStart, stbl.end);
    const stsd = findBox(stblChildren, 'stsd');
    if (!stsd) continue;

    // stsd: 4 bytes version/flags, 4 bytes entry count, then entries (4-byte size + 4-byte fourCC + data).
    const firstEntryType = fourcc(view, stsd.payloadStart + 12);
    if (firstEntryType !== sampleEntryType) continue;

    const stsz = findBox(stblChildren, 'stsz');
    if (!stsz) continue;
    // stsz: 4 bytes version/flags, 4 bytes uniform sample size (0 = varies, use per-sample table), 4 bytes count.
    const uniformSize = view.getUint32(stsz.payloadStart + 4, false);
    const size = uniformSize !== 0 ? uniformSize : view.getUint32(stsz.payloadStart + 12, false);

    const co64 = findBox(stblChildren, 'co64');
    const stco = findBox(stblChildren, 'stco');
    let offset: number;
    if (co64) {
      const hi = view.getUint32(co64.payloadStart + 8, false);
      const lo = view.getUint32(co64.payloadStart + 12, false);
      offset = hi * 2 ** 32 + lo;
    } else if (stco) {
      offset = view.getUint32(stco.payloadStart + 8, false);
    } else {
      continue;
    }

    return { offset, size };
  }
  return undefined;
}
