import { readIfd, entryValueOffset } from '../binary';

/**
 * Canon's classic (pre-CR3) MakerNote is a plain TIFF sub-IFD, same shape as Nikon/Sony/Fuji's.
 * Consumer/prosumer CR2 bodies don't store shutter count in-file at all (Canon only exposes it
 * over USB PTP for those) — but the professional 1D-series apparently does, inside a documented
 * tag 0x0093 "FileInfo" SHORT array, at a fixed element position.
 *
 * Verified against exiftool on two independent EOS-1D Mark II files and two independent
 * EOS-1Ds Mark II files (different counts, all four matched). The EOS-1D/1Ds Mark III generation
 * has a different FileInfo layout — no match found anywhere in their MakerNote for the known
 * count, so deliberately left unimplemented rather than guessed.
 */

const TAG_FILE_INFO = 0x0093;
const SHORT_ELEMENT_INDEX = 2; // byte index 4, i.e. the 3rd SHORT in the array

interface ModelRule {
  matcher: RegExp;
  confirmed: boolean;
}

const MODEL_RULES: ModelRule[] = [
  { matcher: /^Canon EOS-1D Mark II$/, confirmed: true },
  { matcher: /^Canon EOS-1Ds Mark II$/, confirmed: true },
];

export function readCanonCr2ShutterCount(
  view: DataView,
  base: number,
  makerNoteOffset: number,
  littleEndian: boolean,
  model: string,
): number | null {
  const rule = MODEL_RULES.find((r) => r.matcher.test(model.trim()));
  if (!rule) return null;

  const mnIfd = readIfd(view, base, makerNoteOffset, littleEndian);
  const entry = mnIfd.entries.get(TAG_FILE_INFO);
  if (!entry) return null;

  const valueOffset = entryValueOffset(entry, base);
  const pos = valueOffset + SHORT_ELEMENT_INDEX * 2;
  if (pos + 2 > view.byteLength) return null;

  return view.getUint16(pos, littleEndian);
}
