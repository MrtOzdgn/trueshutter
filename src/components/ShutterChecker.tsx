import { useState, useCallback } from 'preact/hooks';
import { readShutterCount, type ShutterCountResult } from '../engine';

interface FileResult {
  id: string;
  fileName: string;
  result: ShutterCountResult;
}

const SUPPORTED_FORMATS = ['NEF', 'ARW', 'CR3', 'RAF'];

export default function ShutterChecker() {
  const [results, setResults] = useState<FileResult[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setIsProcessing(true);
    for (const file of fileArray) {
      const result = await readShutterCount(file);
      setResults((prev) => [{ id: `${file.name}-${file.size}-${Date.now()}`, fileName: file.name, result }, ...prev]);
    }
    setIsProcessing(false);
  }, []);

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer?.files) processFiles(e.dataTransfer.files);
    },
    [processFiles],
  );

  const onFileInput = useCallback(
    (e: Event) => {
      const input = e.currentTarget as HTMLInputElement;
      if (input.files) processFiles(input.files);
      input.value = '';
    },
    [processFiles],
  );

  return (
    <div class="checker">
      <label
        class={`dropzone ${isDragging ? 'dropzone--active' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        <input type="file" accept=".nef,.arw,.cr3,.raf" multiple onChange={onFileInput} hidden />
        <div class="dropzone__icon">📷</div>
        <div class="dropzone__title">Drop RAW files here, or click to choose</div>
        <div class="badge badge--privacy">🔒 No upload — 100% local</div>
        <div class="dropzone__formats">
          {SUPPORTED_FORMATS.map((f) => (
            <span class="format-chip" key={f}>
              {f}
            </span>
          ))}
        </div>
      </label>

      {isProcessing && <div class="status-line">Reading…</div>}

      {results.length > 0 && (
        <div class="results">
          {results.map(({ id, fileName, result }) => (
            <ResultRow key={id} fileName={fileName} result={result} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Camera model strings often already name the brand (e.g. "Canon EOS R6", "NIKON D40" next to
 * make "NIKON CORPORATION") — comparing first words avoids both "Canon Canon EOS R6" and the
 * less obvious "NIKON CORPORATION NIKON D40".
 */
function formatCameraName(make: string | null, model: string | null): string {
  const trimmedMake = make?.trim() ?? '';
  const trimmedModel = model?.trim() ?? '';
  const makeFirstWord = trimmedMake.split(/\s+/)[0]?.toLowerCase();
  const modelFirstWord = trimmedModel.split(/\s+/)[0]?.toLowerCase();
  if (makeFirstWord && makeFirstWord === modelFirstWord) return trimmedModel;
  return [trimmedMake, trimmedModel].filter(Boolean).join(' ');
}

function formatDateTaken(raw: string | null): string | null {
  if (!raw) return null;
  const match = raw.match(/^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);
  if (!match) return raw;
  const [, year, month, day, hour, minute] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ResultRow({ fileName, result }: { fileName: string; result: ShutterCountResult }) {
  if (result.status === 'ok') {
    const dateTaken = formatDateTaken(result.dateTaken);
    return (
      <div class="result result--ok">
        <div class="result__count">{result.shutterCount.toLocaleString()}</div>
        <div class="result__meta">
          <div class="result__file">{fileName}</div>
          <div class="result__camera">{formatCameraName(result.make, result.model)}</div>
          {dateTaken && <div class="result__date">{dateTaken}</div>}
        </div>
      </div>
    );
  }

  if (result.status === 'unsupported') {
    return (
      <div class="result result--unsupported">
        <div class="result__count">—</div>
        <div class="result__meta">
          <div class="result__file">{fileName}</div>
          {(result.make || result.model) && <div class="result__camera">{formatCameraName(result.make, result.model)}</div>}
          <div class="result__source">{result.reason}</div>
        </div>
      </div>
    );
  }

  return (
    <div class="result result--error">
      <div class="result__count">⚠</div>
      <div class="result__meta">
        <div class="result__file">{fileName}</div>
        <div class="result__source">{result.message}</div>
      </div>
    </div>
  );
}
