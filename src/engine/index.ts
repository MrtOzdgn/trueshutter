import { detectContainer, formatFromExtension } from './format';
import {
  readTiffHeader,
  readIfd,
  readEntryAsAscii,
  readEntryAsUint32,
  entryValueOffset,
  TAG_MAKE,
  TAG_MODEL,
  TAG_EXIF_IFD_POINTER,
  TAG_MAKER_NOTE,
} from './binary';
import { readNikonShutterCount } from './makernote/nikon';
import { readSonyShutterCount } from './makernote/sony';
import { readCanonCr3 } from './makernote/canon';
import { readFujiShutterCount } from './makernote/fuji';
import { isRaf, findEmbeddedTiffBase } from './raf';
import type { RawFormat, ShutterCountResult } from './types';

export type { ShutterCountResult } from './types';

export async function readShutterCount(file: File): Promise<ShutterCountResult> {
  let buffer: ArrayBuffer;
  try {
    buffer = await file.arrayBuffer();
  } catch (err) {
    return { status: 'error', message: `Could not read file: ${(err as Error).message}` };
  }

  const view = new DataView(buffer);
  const container = detectContainer(view);
  const extFormat = formatFromExtension(file.name);

  if (container === 'isobmff') {
    return readFromCanonCr3(view, extFormat);
  }

  if (container === 'raf') {
    return readFromRaf(view, extFormat);
  }

  if (container !== 'tiff') {
    return { status: 'unsupported', make: null, model: null, format: extFormat, reason: 'This file is not a recognized RAW format.' };
  }

  return readFromTiff(view, 0, extFormat);
}

function readFromRaf(view: DataView, format: RawFormat): ShutterCountResult {
  if (!isRaf(view)) {
    return { status: 'unsupported', make: null, model: null, format, reason: 'This file is not a recognized RAF file.' };
  }
  const tiffBase = findEmbeddedTiffBase(view);
  if (tiffBase === null) {
    return { status: 'unsupported', make: null, model: null, format, reason: 'Could not locate embedded EXIF data in this RAF file.' };
  }
  return readFromTiff(view, tiffBase, format);
}

function readFromCanonCr3(view: DataView, format: RawFormat): ShutterCountResult {
  try {
    const result = readCanonCr3(view);
    if (!result) {
      return { status: 'unsupported', make: null, model: null, format, reason: 'Could not parse this CR3 file structure.' };
    }
    const { make, model, shutterCount } = result;
    if (shutterCount === null) {
      return {
        status: 'unsupported',
        make: make || null,
        model: model || null,
        format,
        reason: `Shutter count extraction for "${model.trim() || 'this camera'}" is not supported yet.`,
      };
    }
    return { status: 'ok', make, model, format, shutterCount, source: 'Canon CTMD track, MakerNote tag 0x000D' };
  } catch (err) {
    return { status: 'error', message: (err as Error).message };
  }
}

function readFromTiff(view: DataView, base: number, format: RawFormat): ShutterCountResult {
  let make = '';
  let model = '';

  try {
    const header = readTiffHeader(view, base);
    const ifd0 = readIfd(view, base, header.ifd0Offset, header.littleEndian);

    const makeEntry = ifd0.entries.get(TAG_MAKE);
    const modelEntry = ifd0.entries.get(TAG_MODEL);
    if (makeEntry) make = readEntryAsAscii(view, makeEntry, base);
    if (modelEntry) model = readEntryAsAscii(view, modelEntry, base);

    const exifIfdEntry = ifd0.entries.get(TAG_EXIF_IFD_POINTER);
    if (!exifIfdEntry) {
      return { status: 'unsupported', make: make || null, model: model || null, format, reason: 'No Exif sub-IFD found.' };
    }
    // exifIfdEntry's stored value is an offset relative to `base`, per the TIFF spec — add
    // `base` to get an absolute file position (readEntryAsUint32 only decodes the raw stored
    // number, it doesn't know this particular value is itself a pointer needing that shift).
    const exifIfdOffset = base + readEntryAsUint32(view, exifIfdEntry, base, header.littleEndian);
    const exifIfd = readIfd(view, base, exifIfdOffset, header.littleEndian);

    const makerNoteEntry = exifIfd.entries.get(TAG_MAKER_NOTE);
    if (!makerNoteEntry) {
      return {
        status: 'unsupported',
        make: make || null,
        model: model || null,
        format,
        reason: 'No MakerNote metadata found in this file.',
      };
    }
    const makerNoteOffset = entryValueOffset(makerNoteEntry, base);

    if (/nikon/i.test(make)) {
      const count = readNikonShutterCount(view, makerNoteOffset);
      if (count === null) {
        return {
          status: 'unsupported',
          make,
          model,
          format,
          reason: 'Could not locate a ShutterCount tag in this Nikon MakerNote.',
        };
      }
      return { status: 'ok', make, model, format, shutterCount: count, source: 'Nikon MakerNote tag 0x00A7' };
    }

    if (/sony/i.test(make)) {
      const count = readSonyShutterCount(view, base, makerNoteOffset, header.littleEndian, model);
      if (count === null) {
        return {
          status: 'unsupported',
          make,
          model,
          format,
          reason: `Shutter count offset for "${model.trim()}" is not yet in our supported-model table.`,
        };
      }
      return { status: 'ok', make, model, format, shutterCount: count, source: 'Sony MakerNote tag 0x9050 (deciphered)' };
    }

    if (/fujifilm/i.test(make)) {
      const count = readFujiShutterCount(view, makerNoteOffset, header.littleEndian);
      if (count === null) {
        return {
          status: 'unsupported',
          make,
          model,
          format,
          reason: 'Could not locate an ImageCount tag in this Fujifilm MakerNote.',
        };
      }
      return { status: 'ok', make, model, format, shutterCount: count, source: 'Fujifilm MakerNote tag 0x1438' };
    }

    return {
      status: 'unsupported',
      make: make || null,
      model: model || null,
      format,
      reason: `${make || 'This camera brand'} is not supported yet.`,
    };
  } catch (err) {
    return { status: 'error', message: (err as Error).message };
  }
}
