export type RawFormat = 'CR2' | 'CR3' | 'NEF' | 'ARW' | 'RAF' | 'ORF' | 'RW2' | 'DNG' | 'JPEG' | 'UNKNOWN';

/**
 * Every reason/source the engine can report, as a stable key rather than English prose — the
 * UI layer looks these up in a translation dictionary. Keeps the engine itself
 * presentation/language-agnostic; only `params` carries data (camera names, brands) that
 * can't be pre-translated.
 */
export type MessageKey =
  | 'unrecognizedFormat'
  | 'unrecognizedRaf'
  | 'noExifInRaf'
  | 'unrecognizedJpeg'
  | 'noExifInJpeg'
  | 'unparseableCr3'
  | 'cr3ModelNotSupported'
  | 'noExifSubIfd'
  | 'noMakerNote'
  | 'nikonNoShutterCountTag'
  | 'sonyOffsetNotInTable'
  | 'fujiNoImageCountTag'
  | 'canonCr2NotSupported'
  | 'brandNotSupported'
  | 'sourceCanonCtmd'
  | 'sourceNikonMakerNote'
  | 'sourceSonyMakerNote'
  | 'sourceFujiMakerNote'
  | 'sourceCanonFileInfo';

export interface Message {
  key: MessageKey;
  params?: Record<string, string>;
}

export interface ShutterCountOk {
  status: 'ok';
  make: string;
  model: string;
  format: RawFormat;
  shutterCount: number;
  /** Where the value came from, for transparency — a translation key, not display text. */
  source: Message;
  /** Raw EXIF DateTimeOriginal, format "YYYY:MM:DD HH:MM:SS", or null if not present. */
  dateTaken: string | null;
}

export interface ShutterCountUnsupported {
  status: 'unsupported';
  make: string | null;
  model: string | null;
  format: RawFormat;
  reason: Message;
}

export interface ShutterCountError {
  status: 'error';
  message: string;
}

export type ShutterCountResult = ShutterCountOk | ShutterCountUnsupported | ShutterCountError;
