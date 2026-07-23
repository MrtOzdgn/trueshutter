import type { Locale } from './config';

export interface UiStrings {
  siteTagline: string;
  metaDescription: string;
  dropzoneTitle: string;
  privacyBadge: string;
  reading: string;
  footerFormats: string;
  browseCameras: string;
  coffeeLink: string;
  backToTool: string;
  allSupportedCameras: string;
  camerasPageTitle: string;
  camerasPageDescription: string;
  camerasLegend: string;
  statusConfirmed: string;
  statusExpected: string;
  statusUnsupported: string;
  checkCameraCta: (model: string) => string;
  confirmedCopy: (format: string) => string;
  expectedCopy: string;
  unsupportedCopy: string;
  mechanismCopy: (params: { makeModel: string; mechanism: string; format: string }) => string;
  ratedLifeCopy: (params: { model: string; life: string }) => string;
  cameraPageTitleSuffix: string;
  languageLabel: string;
}

const en: UiStrings = {
  siteTagline: "Check your camera's shutter count from a RAW file — instantly, in your browser.",
  metaDescription: "Check your camera's shutter count instantly from a RAW file. Runs entirely in your browser — nothing is ever uploaded.",
  dropzoneTitle: 'Drop RAW files here, or click to choose',
  privacyBadge: '🔒 No upload — 100% local',
  reading: 'Reading…',
  footerFormats: 'Nikon NEF · Sony ARW · Canon CR3/CR2 · Fujifilm RAF · DNG · JPEG — no tracking, no ads, no uploads.',
  browseCameras: 'Browse supported cameras →',
  coffeeLink: '☕ Buy me a coffee',
  backToTool: '← Back to the tool',
  allSupportedCameras: '← All supported cameras',
  camerasPageTitle: 'Supported Cameras',
  camerasPageDescription: 'Every camera model TrueShutter can read a shutter count from, and which ones are confirmed vs. still being validated.',
  camerasLegend:
    "✓ confirmed = tested against a real sample file and cross-checked with exiftool. ◐ expected = same documented mechanism as a confirmed sibling model, not personally tested yet. ✗ not supported = the camera doesn't store shutter count in the file, or we haven't found the right offset yet.",
  statusConfirmed: '✓ Confirmed',
  statusExpected: '◐ Expected to work',
  statusUnsupported: '✗ Not supported',
  checkCameraCta: (model) => `Check your ${model} shutter count →`,
  confirmedCopy: (format) =>
    `We've tested this exact camera against a real ${format} sample file and independently verified the shutter count against exiftool — this one is confirmed working.`,
  expectedCopy:
    "This camera hasn't been personally tested here yet, but it shares its metadata layout with a sibling model we have confirmed, so it's expected to work the same way.",
  unsupportedCopy: "We don't yet support reading shutter count for this camera.",
  mechanismCopy: ({ makeModel, mechanism, format }) =>
    `Shutter count for the ${makeModel} is read from ${mechanism} in the camera's ${format} file metadata — entirely in your browser, the file is never uploaded anywhere.`,
  ratedLifeCopy: ({ model, life }) =>
    `Canon, Nikon, Sony and Fujifilm publish a rated shutter durability for most bodies — for the ${model}, that figure is approximately ${life} actuations. This is a statistical durability rating from the manufacturer, not a hard limit — many shutters keep working well past it, and some fail earlier.`,
  cameraPageTitleSuffix: 'Shutter Count — How to Check It',
  languageLabel: 'Language',
};

const es: UiStrings = {
  siteTagline: 'Comprueba el contador de disparos de tu cámara a partir de un archivo RAW — al instante, en tu navegador.',
  metaDescription: 'Comprueba al instante el contador de disparos de tu cámara desde un archivo RAW. Funciona completamente en tu navegador — nunca se sube nada.',
  dropzoneTitle: 'Arrastra archivos RAW aquí, o haz clic para elegir',
  privacyBadge: '🔒 Sin subida — 100% local',
  reading: 'Leyendo…',
  footerFormats: 'Nikon NEF · Sony ARW · Canon CR3/CR2 · Fujifilm RAF · DNG · JPEG — sin rastreo, sin anuncios, sin subidas.',
  browseCameras: 'Ver cámaras compatibles →',
  coffeeLink: '☕ Invítame a un café',
  backToTool: '← Volver a la herramienta',
  allSupportedCameras: '← Todas las cámaras compatibles',
  camerasPageTitle: 'Cámaras Compatibles',
  camerasPageDescription: 'Todos los modelos de cámara de los que TrueShutter puede leer el contador de disparos, y cuáles están confirmados frente a los que aún se están validando.',
  camerasLegend:
    '✓ confirmado = probado con un archivo de muestra real y verificado con exiftool. ◐ esperado = mismo mecanismo documentado que un modelo hermano confirmado, aún no probado personalmente. ✗ no compatible = la cámara no guarda el contador de disparos en el archivo, o aún no hemos encontrado el desplazamiento correcto.',
  statusConfirmed: '✓ Confirmado',
  statusExpected: '◐ Se espera que funcione',
  statusUnsupported: '✗ No compatible',
  checkCameraCta: (model) => `Comprueba el contador de disparos de tu ${model} →`,
  confirmedCopy: (format) =>
    `Hemos probado esta cámara exacta con un archivo de muestra ${format} real y verificado de forma independiente el contador de disparos con exiftool — esta está confirmada y funciona.`,
  expectedCopy:
    'Esta cámara aún no se ha probado personalmente aquí, pero comparte el mismo esquema de metadatos que un modelo hermano ya confirmado, por lo que se espera que funcione igual.',
  unsupportedCopy: 'Todavía no admitimos la lectura del contador de disparos para esta cámara.',
  mechanismCopy: ({ makeModel, mechanism, format }) =>
    `El contador de disparos de la ${makeModel} se lee desde ${mechanism} en los metadatos del archivo ${format} de la cámara — todo en tu navegador, el archivo nunca se sube a ningún sitio.`,
  ratedLifeCopy: ({ model, life }) =>
    `Canon, Nikon, Sony y Fujifilm publican una durabilidad nominal del obturador para la mayoría de sus cuerpos — para la ${model}, esa cifra es de aproximadamente ${life} disparos. Es una estimación estadística del fabricante, no un límite estricto — muchos obturadores siguen funcionando bien más allá de esa cifra, y algunos fallan antes.`,
  cameraPageTitleSuffix: 'Contador de Disparos — Cómo Comprobarlo',
  languageLabel: 'Idioma',
};

const de: UiStrings = {
  siteTagline: 'Ermitteln Sie den Auslösezähler Ihrer Kamera aus einer RAW-Datei — sofort, direkt im Browser.',
  metaDescription: 'Ermitteln Sie sofort den Auslösezähler Ihrer Kamera aus einer RAW-Datei. Läuft vollständig in Ihrem Browser — es wird nie etwas hochgeladen.',
  dropzoneTitle: 'RAW-Dateien hier ablegen oder zum Auswählen klicken',
  privacyBadge: '🔒 Kein Upload — 100% lokal',
  reading: 'Wird gelesen…',
  footerFormats: 'Nikon NEF · Sony ARW · Canon CR3/CR2 · Fujifilm RAF · DNG · JPEG — kein Tracking, keine Werbung, kein Upload.',
  browseCameras: 'Unterstützte Kameras durchsuchen →',
  coffeeLink: '☕ Spendier mir einen Kaffee',
  backToTool: '← Zurück zum Tool',
  allSupportedCameras: '← Alle unterstützten Kameras',
  camerasPageTitle: 'Unterstützte Kameras',
  camerasPageDescription: 'Alle Kameramodelle, bei denen TrueShutter den Auslösezähler auslesen kann, und welche davon bestätigt bzw. noch nicht validiert sind.',
  camerasLegend:
    '✓ bestätigt = anhand einer echten Beispieldatei getestet und mit exiftool abgeglichen. ◐ erwartet = gleicher dokumentierter Mechanismus wie bei einem bestätigten Schwestermodell, noch nicht persönlich getestet. ✗ nicht unterstützt = die Kamera speichert den Auslösezähler nicht in der Datei, oder wir haben den richtigen Offset noch nicht gefunden.',
  statusConfirmed: '✓ Bestätigt',
  statusExpected: '◐ Sollte funktionieren',
  statusUnsupported: '✗ Nicht unterstützt',
  checkCameraCta: (model) => `Auslösezähler Ihrer ${model} prüfen →`,
  confirmedCopy: (format) =>
    `Wir haben genau diese Kamera anhand einer echten ${format}-Beispieldatei getestet und den Auslösezähler unabhängig mit exiftool verifiziert — bestätigt funktionierend.`,
  expectedCopy:
    'Diese Kamera wurde hier noch nicht persönlich getestet, teilt aber das Metadaten-Layout mit einem bereits bestätigten Schwestermodell, weshalb sie voraussichtlich genauso funktioniert.',
  unsupportedCopy: 'Für diese Kamera können wir den Auslösezähler noch nicht auslesen.',
  mechanismCopy: ({ makeModel, mechanism, format }) =>
    `Der Auslösezähler der ${makeModel} wird aus ${mechanism} in den ${format}-Metadaten der Kamera ausgelesen — vollständig in Ihrem Browser, die Datei wird niemals irgendwohin hochgeladen.`,
  ratedLifeCopy: ({ model, life }) =>
    `Canon, Nikon, Sony und Fujifilm geben für die meisten Modelle eine Auslöser-Haltbarkeit an — für die ${model} liegt dieser Wert bei etwa ${life} Auslösungen. Das ist ein statistischer Richtwert des Herstellers, keine harte Grenze — viele Verschlüsse halten deutlich länger, manche versagen früher.`,
  cameraPageTitleSuffix: 'Auslösezähler — So Prüfen Sie Ihn',
  languageLabel: 'Sprache',
};

const fr: UiStrings = {
  siteTagline: "Vérifiez le compteur de déclenchements de votre appareil à partir d'un fichier RAW — instantanément, dans votre navigateur.",
  metaDescription: "Vérifiez instantanément le compteur de déclenchements de votre appareil à partir d'un fichier RAW. Fonctionne entièrement dans votre navigateur — rien n'est jamais téléversé.",
  dropzoneTitle: 'Déposez vos fichiers RAW ici, ou cliquez pour en choisir',
  privacyBadge: '🔒 Aucun téléversement — 100% local',
  reading: 'Lecture…',
  footerFormats: 'Nikon NEF · Sony ARW · Canon CR3/CR2 · Fujifilm RAF · DNG · JPEG — sans suivi, sans publicité, sans téléversement.',
  browseCameras: 'Parcourir les appareils compatibles →',
  coffeeLink: '☕ Offrez-moi un café',
  backToTool: "← Retour à l'outil",
  allSupportedCameras: '← Tous les appareils compatibles',
  camerasPageTitle: 'Appareils Compatibles',
  camerasPageDescription: "Tous les modèles d'appareil dont TrueShutter peut lire le compteur de déclenchements, et lesquels sont confirmés ou encore en cours de validation.",
  camerasLegend:
    "✓ confirmé = testé avec un fichier d'exemple réel et vérifié avec exiftool. ◐ attendu = même mécanisme documenté qu'un modèle apparenté confirmé, pas encore testé personnellement. ✗ non pris en charge = l'appareil ne stocke pas le compteur de déclenchements dans le fichier, ou nous n'avons pas encore trouvé le bon décalage.",
  statusConfirmed: '✓ Confirmé',
  statusExpected: '◐ Devrait fonctionner',
  statusUnsupported: '✗ Non pris en charge',
  checkCameraCta: (model) => `Vérifiez le compteur de déclenchements de votre ${model} →`,
  confirmedCopy: (format) =>
    `Nous avons testé cet appareil exact avec un fichier d'exemple ${format} réel et vérifié indépendamment le compteur de déclenchements avec exiftool — celui-ci est confirmé fonctionnel.`,
  expectedCopy:
    "Cet appareil n'a pas encore été testé personnellement ici, mais il partage la même structure de métadonnées qu'un modèle apparenté déjà confirmé, il devrait donc fonctionner de la même manière.",
  unsupportedCopy: "Nous ne prenons pas encore en charge la lecture du compteur de déclenchements pour cet appareil.",
  mechanismCopy: ({ makeModel, mechanism, format }) =>
    `Le compteur de déclenchements du ${makeModel} est lu depuis ${mechanism} dans les métadonnées du fichier ${format} de l'appareil — entièrement dans votre navigateur, le fichier n'est jamais téléversé nulle part.`,
  ratedLifeCopy: ({ model, life }) =>
    `Canon, Nikon, Sony et Fujifilm publient une durabilité nominale de l'obturateur pour la plupart des boîtiers — pour le ${model}, ce chiffre est d'environ ${life} déclenchements. Il s'agit d'une estimation statistique du fabricant, pas d'une limite stricte — de nombreux obturateurs continuent de fonctionner bien au-delà, et certains tombent en panne plus tôt.`,
  cameraPageTitleSuffix: 'Compteur de Déclenchements — Comment le Vérifier',
  languageLabel: 'Langue',
};

const ja: UiStrings = {
  siteTagline: 'RAWファイルからカメラのシャッターカウントをブラウザ上で即座に確認できます。',
  metaDescription: 'RAWファイルからカメラのシャッターカウントを即座に確認できます。すべてブラウザ内で処理され、ファイルがアップロードされることはありません。',
  dropzoneTitle: 'RAWファイルをここにドロップ、またはクリックして選択',
  privacyBadge: '🔒 アップロードなし — 100%ローカル処理',
  reading: '読み取り中…',
  footerFormats: 'Nikon NEF · Sony ARW · Canon CR3/CR2 · Fujifilm RAF · DNG · JPEG — トラッキングなし、広告なし、アップロードなし。',
  browseCameras: '対応カメラ一覧を見る →',
  coffeeLink: '☕ コーヒーをおごる',
  backToTool: '← ツールに戻る',
  allSupportedCameras: '← 対応カメラ一覧に戻る',
  camerasPageTitle: '対応カメラ一覧',
  camerasPageDescription: 'TrueShutterがシャッターカウントを読み取れるすべてのカメラモデルと、確認済みかどうかの状況。',
  camerasLegend:
    '✓ 確認済み = 実際のサンプルファイルでテストし、exiftoolと照合済み。◐ 対応予定 = 確認済みの姉妹モデルと同じ仕組みだが、まだ個別にテストしていない。✗ 非対応 = カメラがファイルにシャッターカウントを保存していないか、正しいオフセットがまだ見つかっていない。',
  statusConfirmed: '✓ 確認済み',
  statusExpected: '◐ 対応予定',
  statusUnsupported: '✗ 非対応',
  checkCameraCta: (model) => `${model}のシャッターカウントを確認 →`,
  confirmedCopy: (format) =>
    `このカメラは実際の${format}サンプルファイルでテスト済みで、シャッターカウントをexiftoolと照合して独自に検証しています — 動作確認済みです。`,
  expectedCopy: 'このカメラはまだ個別にテストされていませんが、確認済みの姉妹モデルと同じメタデータ構造を持つため、同様に動作すると考えられます。',
  unsupportedCopy: 'このカメラのシャッターカウントの読み取りにはまだ対応していません。',
  mechanismCopy: ({ makeModel, mechanism, format }) =>
    `${makeModel}のシャッターカウントは、カメラの${format}ファイルのメタデータ内、${mechanism}から読み取られます — すべてブラウザ内で処理され、ファイルはどこにもアップロードされません。`,
  ratedLifeCopy: ({ model, life }) =>
    `Canon、Nikon、Sony、Fujifilmはほとんどの機種についてシャッターの定格耐久性を公表しています — ${model}の場合、その数値は約${life}回です。これはメーカーによる統計的な耐久性の目安であり、絶対的な上限ではありません — それを大きく超えて動作し続けるシャッターも多く、逆にそれより早く故障するものもあります。`,
  cameraPageTitleSuffix: 'シャッターカウント — 確認方法',
  languageLabel: '言語',
};

const dictionaries: Record<Locale, UiStrings> = { en, es, de, fr, ja };

export function getUiStrings(locale: Locale): UiStrings {
  return dictionaries[locale] ?? dictionaries.en;
}
