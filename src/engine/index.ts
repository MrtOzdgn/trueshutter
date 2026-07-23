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
  TAG_DATE_TIME_ORIGINAL,
} from './binary';
import { readNikonShutterCount } from './makernote/nikon';
import { readSonyShutterCount } from './makernote/sony';
import { readCanonCr3 } from './makernote/canon';
import { readCanonCr2ShutterCount } from './makernote/canonCr2';
import { readFujiShutterCount } from './makernote/fuji';
import { isRaf, findEmbeddedTiffBase } from './raf';
import { isJpeg, findEmbeddedTiffBase as findJpegTiffBase } from './jpeg';
import type { RawFormat, ShutterCountResult, Message } from './types';

export type { ShutterCountResult, Message, MessageKey } from './types';

function msg(key: Message['key'], params?: Message['params']): Message {
  return params ? { key, params } : { key };
}

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

  if (container === 'jpeg') {
    return readFromJpeg(view, extFormat);
  }

  if (container !== 'tiff') {
    return { status: 'unsupported', make: null, model: null, format: extFormat, reason: msg('unrecognizedFormat') };
  }

  return readFromTiff(view, 0, extFormat);
}

function readFromRaf(view: DataView, format: RawFormat): ShutterCountResult {
  try {
    if (!isRaf(view)) {
      return { status: 'unsupported', make: null, model: null, format, reason: msg('unrecognizedRaf') };
    }
    const tiffBase = findEmbeddedTiffBase(view);
    if (tiffBase === null) {
      return { status: 'unsupported', make: null, model: null, format, reason: msg('noExifInRaf') };
    }
    return readFromTiff(view, tiffBase, format);
  } catch (err) {
    return { status: 'error', message: (err as Error).message };
  }
}

function readFromJpeg(view: DataView, format: RawFormat): ShutterCountResult {
  try {
    if (!isJpeg(view)) {
      return { status: 'unsupported', make: null, model: null, format, reason: msg('unrecognizedJpeg') };
    }
    const tiffBase = findJpegTiffBase(view);
    if (tiffBase === null) {
      return { status: 'unsupported', make: null, model: null, format, reason: msg('noExifInJpeg') };
    }
    return readFromTiff(view, tiffBase, format);
  } catch (err) {
    return { status: 'error', message: (err as Error).message };
  }
}

function readFromCanonCr3(view: DataView, format: RawFormat): ShutterCountResult {
  try {
    const result = readCanonCr3(view);
    if (!result) {
      return { status: 'unsupported', make: null, model: null, format, reason: msg('unparseableCr3') };
    }
    const { make, model, shutterCount, dateTaken } = result;
    if (shutterCount === null) {
      return {
        status: 'unsupported',
        make: make || null,
        model: model || null,
        format,
        reason: msg('cr3ModelNotSupported', { model: model.trim() || 'this camera' }),
      };
    }
    return { status: 'ok', make, model, format, shutterCount, source: msg('sourceCanonCtmd'), dateTaken };
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
      return { status: 'unsupported', make: make || null, model: model || null, format, reason: msg('noExifSubIfd') };
    }
    // exifIfdEntry's stored value is an offset relative to `base`, per the TIFF spec — add
    // `base` to get an absolute file position (readEntryAsUint32 only decodes the raw stored
    // number, it doesn't know this particular value is itself a pointer needing that shift).
    const exifIfdOffset = base + readEntryAsUint32(view, exifIfdEntry, base, header.littleEndian);
    const exifIfd = readIfd(view, base, exifIfdOffset, header.littleEndian);

    const dateEntry = exifIfd.entries.get(TAG_DATE_TIME_ORIGINAL);
    const dateTaken = dateEntry ? readEntryAsAscii(view, dateEntry, base) : null;

    const makerNoteEntry = exifIfd.entries.get(TAG_MAKER_NOTE);
    if (!makerNoteEntry) {
      return { status: 'unsupported', make: make || null, model: model || null, format, reason: msg('noMakerNote') };
    }
    const makerNoteOffset = entryValueOffset(makerNoteEntry, base);

    if (/nikon/i.test(make)) {
      const count = readNikonShutterCount(view, makerNoteOffset);
      if (count === null) {
        return { status: 'unsupported', make, model, format, reason: msg('nikonNoShutterCountTag') };
      }
      return { status: 'ok', make, model, format, shutterCount: count, source: msg('sourceNikonMakerNote'), dateTaken };
    }

    if (/sony/i.test(make)) {
      const count = readSonyShutterCount(view, base, makerNoteOffset, header.littleEndian, model);
      if (count === null) {
        return { status: 'unsupported', make, model, format, reason: msg('sonyOffsetNotInTable', { model: model.trim() }) };
      }
      return { status: 'ok', make, model, format, shutterCount: count, source: msg('sourceSonyMakerNote'), dateTaken };
    }

    if (/fujifilm/i.test(make)) {
      const count = readFujiShutterCount(view, makerNoteOffset, header.littleEndian);
      if (count === null) {
        return { status: 'unsupported', make, model, format, reason: msg('fujiNoImageCountTag') };
      }
      return { status: 'ok', make, model, format, shutterCount: count, source: msg('sourceFujiMakerNote'), dateTaken };
    }

    if (/canon/i.test(make)) {
      const count = readCanonCr2ShutterCount(view, base, makerNoteOffset, header.littleEndian, model);
      if (count === null) {
        return {
          status: 'unsupported',
          make,
          model,
          format,
          reason: format === 'CR2' ? msg('canonCr2NotSupported', { model: model.trim() }) : msg('brandNotSupported', { make: make.trim() }),
        };
      }
      return { status: 'ok', make, model, format, shutterCount: count, source: msg('sourceCanonFileInfo'), dateTaken };
    }

    return {
      status: 'unsupported',
      make: make || null,
      model: model || null,
      format,
      reason: msg('brandNotSupported', { make: make || 'This camera brand' }),
    };
  } catch (err) {
    return { status: 'error', message: (err as Error).message };
  }
}
