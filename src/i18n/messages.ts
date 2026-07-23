import type { Locale } from './config';
import type { Message, MessageKey } from '../engine/types';

type Template = (params: Record<string, string>) => string;
type MessageDict = Record<MessageKey, string | Template>;

const en: MessageDict = {
  unrecognizedFormat: 'This file is not a recognized RAW format.',
  unrecognizedRaf: 'This file is not a recognized RAF file.',
  noExifInRaf: 'Could not locate embedded EXIF data in this RAF file.',
  unrecognizedJpeg: 'This file is not a recognized JPEG file.',
  noExifInJpeg: 'No EXIF data found in this JPEG — it may have been edited or re-saved, which typically strips MakerNote data.',
  unparseableCr3: 'Could not parse this CR3 file structure.',
  cr3ModelNotSupported: (p) => `Shutter count extraction for "${p.model}" is not supported yet.`,
  noExifSubIfd: 'No Exif sub-IFD found.',
  noMakerNote: 'No MakerNote metadata found in this file.',
  nikonNoShutterCountTag: 'Could not locate a ShutterCount tag in this Nikon MakerNote.',
  sonyOffsetNotInTable: (p) => `Shutter count offset for "${p.model}" is not yet in our supported-model table.`,
  fujiNoImageCountTag: 'Could not locate an ImageCount tag in this Fujifilm MakerNote.',
  canonCr2NotSupported: (p) =>
    `Shutter count for "${p.model}" is not stored in-file, or isn't supported yet — only the 1D/1Ds Mark II professional bodies are currently supported for CR2.`,
  brandNotSupported: (p) => `${p.make} is not supported yet.`,
  sourceCanonCtmd: 'Canon CTMD track, MakerNote tag 0x000D',
  sourceNikonMakerNote: 'Nikon MakerNote tag 0x00A7',
  sourceSonyMakerNote: 'Sony MakerNote tag 0x9050 (deciphered)',
  sourceFujiMakerNote: 'Fujifilm MakerNote tag 0x1438',
  sourceCanonFileInfo: 'Canon MakerNote tag 0x0093 (FileInfo)',
};

const es: MessageDict = {
  unrecognizedFormat: 'Este archivo no es un formato RAW reconocido.',
  unrecognizedRaf: 'Este archivo no es un archivo RAF reconocido.',
  noExifInRaf: 'No se encontraron datos EXIF incrustados en este archivo RAF.',
  unrecognizedJpeg: 'Este archivo no es un archivo JPEG reconocido.',
  noExifInJpeg: 'No se encontraron datos EXIF en este JPEG — puede haber sido editado o regrabado, lo cual normalmente elimina los datos MakerNote.',
  unparseableCr3: 'No se pudo analizar la estructura de este archivo CR3.',
  cr3ModelNotSupported: (p) => `La extracción del contador de disparos para "${p.model}" aún no es compatible.`,
  noExifSubIfd: 'No se encontró el sub-IFD Exif.',
  noMakerNote: 'No se encontraron metadatos MakerNote en este archivo.',
  nikonNoShutterCountTag: 'No se pudo localizar la etiqueta ShutterCount en este MakerNote de Nikon.',
  sonyOffsetNotInTable: (p) => `El desplazamiento del contador de disparos para "${p.model}" aún no está en nuestra tabla de modelos compatibles.`,
  fujiNoImageCountTag: 'No se pudo localizar la etiqueta ImageCount en este MakerNote de Fujifilm.',
  canonCr2NotSupported: (p) =>
    `El contador de disparos de "${p.model}" no se guarda en el archivo, o aún no es compatible — solo los cuerpos profesionales 1D/1Ds Mark II son compatibles actualmente para CR2.`,
  brandNotSupported: (p) => `${p.make} aún no es compatible.`,
  sourceCanonCtmd: 'Pista CTMD de Canon, etiqueta MakerNote 0x000D',
  sourceNikonMakerNote: 'Etiqueta MakerNote de Nikon 0x00A7',
  sourceSonyMakerNote: 'Etiqueta MakerNote de Sony 0x9050 (descifrada)',
  sourceFujiMakerNote: 'Etiqueta MakerNote de Fujifilm 0x1438',
  sourceCanonFileInfo: 'Etiqueta MakerNote de Canon 0x0093 (FileInfo)',
};

const de: MessageDict = {
  unrecognizedFormat: 'Diese Datei ist kein erkanntes RAW-Format.',
  unrecognizedRaf: 'Diese Datei ist keine erkannte RAF-Datei.',
  noExifInRaf: 'In dieser RAF-Datei konnten keine eingebetteten EXIF-Daten gefunden werden.',
  unrecognizedJpeg: 'Diese Datei ist keine erkannte JPEG-Datei.',
  noExifInJpeg: 'In diesem JPEG wurden keine EXIF-Daten gefunden — es wurde möglicherweise bearbeitet oder erneut gespeichert, wodurch MakerNote-Daten meist entfernt werden.',
  unparseableCr3: 'Die Struktur dieser CR3-Datei konnte nicht analysiert werden.',
  cr3ModelNotSupported: (p) => `Die Auslösezähler-Extraktion für „${p.model}" wird noch nicht unterstützt.`,
  noExifSubIfd: 'Kein Exif-Sub-IFD gefunden.',
  noMakerNote: 'In dieser Datei wurden keine MakerNote-Metadaten gefunden.',
  nikonNoShutterCountTag: 'In diesem Nikon-MakerNote konnte kein ShutterCount-Tag gefunden werden.',
  sonyOffsetNotInTable: (p) => `Der Auslösezähler-Offset für „${p.model}" ist noch nicht in unserer Modelltabelle enthalten.`,
  fujiNoImageCountTag: 'In diesem Fujifilm-MakerNote konnte kein ImageCount-Tag gefunden werden.',
  canonCr2NotSupported: (p) =>
    `Der Auslösezähler für „${p.model}" wird nicht in der Datei gespeichert oder wird noch nicht unterstützt — für CR2 werden derzeit nur die professionellen 1D/1Ds Mark II-Modelle unterstützt.`,
  brandNotSupported: (p) => `${p.make} wird noch nicht unterstützt.`,
  sourceCanonCtmd: 'Canon CTMD-Spur, MakerNote-Tag 0x000D',
  sourceNikonMakerNote: 'Nikon MakerNote-Tag 0x00A7',
  sourceSonyMakerNote: 'Sony MakerNote-Tag 0x9050 (entschlüsselt)',
  sourceFujiMakerNote: 'Fujifilm MakerNote-Tag 0x1438',
  sourceCanonFileInfo: 'Canon MakerNote-Tag 0x0093 (FileInfo)',
};

const fr: MessageDict = {
  unrecognizedFormat: "Ce fichier n'est pas un format RAW reconnu.",
  unrecognizedRaf: "Ce fichier n'est pas un fichier RAF reconnu.",
  noExifInRaf: 'Impossible de localiser les données EXIF intégrées dans ce fichier RAF.',
  unrecognizedJpeg: "Ce fichier n'est pas un fichier JPEG reconnu.",
  noExifInJpeg: "Aucune donnée EXIF trouvée dans ce JPEG — il a peut-être été modifié ou réenregistré, ce qui supprime généralement les données MakerNote.",
  unparseableCr3: "Impossible d'analyser la structure de ce fichier CR3.",
  cr3ModelNotSupported: (p) => `L'extraction du compteur de déclenchements pour « ${p.model} » n'est pas encore prise en charge.`,
  noExifSubIfd: 'Aucun sous-IFD Exif trouvé.',
  noMakerNote: 'Aucune métadonnée MakerNote trouvée dans ce fichier.',
  nikonNoShutterCountTag: "Impossible de localiser une balise ShutterCount dans ce MakerNote Nikon.",
  sonyOffsetNotInTable: (p) => `Le décalage du compteur de déclenchements pour « ${p.model} » n'est pas encore dans notre table de modèles pris en charge.`,
  fujiNoImageCountTag: 'Impossible de localiser une balise ImageCount dans ce MakerNote Fujifilm.',
  canonCr2NotSupported: (p) =>
    `Le compteur de déclenchements pour « ${p.model} » n'est pas stocké dans le fichier, ou n'est pas encore pris en charge — seuls les boîtiers professionnels 1D/1Ds Mark II sont actuellement pris en charge pour le CR2.`,
  brandNotSupported: (p) => `${p.make} n'est pas encore pris en charge.`,
  sourceCanonCtmd: 'Piste CTMD Canon, balise MakerNote 0x000D',
  sourceNikonMakerNote: 'Balise MakerNote Nikon 0x00A7',
  sourceSonyMakerNote: 'Balise MakerNote Sony 0x9050 (déchiffrée)',
  sourceFujiMakerNote: 'Balise MakerNote Fujifilm 0x1438',
  sourceCanonFileInfo: 'Balise MakerNote Canon 0x0093 (FileInfo)',
};

const ja: MessageDict = {
  unrecognizedFormat: 'このファイルは認識できるRAW形式ではありません。',
  unrecognizedRaf: 'このファイルは認識できるRAFファイルではありません。',
  noExifInRaf: 'このRAFファイル内に埋め込みEXIFデータが見つかりませんでした。',
  unrecognizedJpeg: 'このファイルは認識できるJPEGファイルではありません。',
  noExifInJpeg: 'このJPEGにはEXIFデータが見つかりませんでした — 編集または再保存された可能性があり、その場合MakerNoteデータは通常失われます。',
  unparseableCr3: 'このCR3ファイルの構造を解析できませんでした。',
  cr3ModelNotSupported: (p) => `「${p.model}」のシャッターカウント抽出にはまだ対応していません。`,
  noExifSubIfd: 'Exifサブ IFDが見つかりませんでした。',
  noMakerNote: 'このファイルにはMakerNoteメタデータが見つかりませんでした。',
  nikonNoShutterCountTag: 'このNikon MakerNote内にShutterCountタグが見つかりませんでした。',
  sonyOffsetNotInTable: (p) => `「${p.model}」のシャッターカウントのオフセットはまだ対応モデル表に登録されていません。`,
  fujiNoImageCountTag: 'このFujifilm MakerNote内にImageCountタグが見つかりませんでした。',
  canonCr2NotSupported: (p) =>
    `「${p.model}」のシャッターカウントはファイルに保存されていないか、まだ対応していません — CR2形式では現在1D/1Ds Mark IIのプロ機のみ対応しています。`,
  brandNotSupported: (p) => `${p.make}にはまだ対応していません。`,
  sourceCanonCtmd: 'Canon CTMDトラック、MakerNoteタグ 0x000D',
  sourceNikonMakerNote: 'Nikon MakerNoteタグ 0x00A7',
  sourceSonyMakerNote: 'Sony MakerNoteタグ 0x9050（復号済み）',
  sourceFujiMakerNote: 'Fujifilm MakerNoteタグ 0x1438',
  sourceCanonFileInfo: 'Canon MakerNoteタグ 0x0093（FileInfo）',
};

const dictionaries: Record<Locale, MessageDict> = { en, es, de, fr, ja };

export function translateMessage(locale: Locale, message: Message): string {
  const dict = dictionaries[locale] ?? dictionaries.en;
  const entry = dict[message.key] ?? dictionaries.en[message.key];
  if (typeof entry === 'function') return entry(message.params ?? {});
  return entry;
}
