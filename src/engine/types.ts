export type RawFormat = 'CR2' | 'CR3' | 'NEF' | 'ARW' | 'RAF' | 'ORF' | 'RW2' | 'DNG' | 'JPEG' | 'UNKNOWN';

export interface ShutterCountOk {
  status: 'ok';
  make: string;
  model: string;
  format: RawFormat;
  shutterCount: number;
  /** Human-readable description of where the value came from, for transparency. */
  source: string;
}

export interface ShutterCountUnsupported {
  status: 'unsupported';
  make: string | null;
  model: string | null;
  format: RawFormat;
  reason: string;
}

export interface ShutterCountError {
  status: 'error';
  message: string;
}

export type ShutterCountResult = ShutterCountOk | ShutterCountUnsupported | ShutterCountError;
