import { routing } from '@/i18n/routing';

const BASE_URL = 'https://luxhomein.com';

// Solo idiomas activos: hreflang a URLs inexistentes perjudica al SEO
const LOCALES = routing.locales;

/** Returns the full URL for a given path and locale */
export function localizedUrl(path: string, locale: string): string {
  if (locale === 'es') return `${BASE_URL}${path}`;
  return `${BASE_URL}/${locale}${path}`;
}

/**
 * Builds the `alternates` object for Next.js Metadata, including hreflang
 * tags for every locale and an x-default pointing to the Spanish (default) version.
 *
 * Usage in generateMetadata:
 *   alternates: getAlternates('/propiedades')
 *   alternates: getAlternates(`/propiedades/${id}`)
 */
export function getAlternates(path: string) {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    languages[locale] = localizedUrl(path, locale);
  }
  languages['x-default'] = localizedUrl(path, 'es');

  return {
    canonical: localizedUrl(path, 'es'), // canonical always points to the default (ES) version
    languages,
  };
}
