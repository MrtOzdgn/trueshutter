export const locales = ['en', 'es', 'de', 'fr', 'ja'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  de: 'Deutsch',
  fr: 'Français',
  ja: '日本語',
};

/** For a default-locale path (e.g. "/cameras/nikon-d40"), returns the locale-prefixed
 * equivalent (e.g. "/es/cameras/nikon-d40"). The default locale itself has no prefix. */
export function localizedPath(locale: Locale, path: string): string {
  const cleanPath = path.replace(/^\//, '');
  if (locale === defaultLocale) return `/${cleanPath}`;
  return `/${locale}/${cleanPath}`;
}
