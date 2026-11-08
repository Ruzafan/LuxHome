import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';
import { unstable_cache } from 'next/cache';
import { db } from '@/lib/db';
import { CACHE_TTL, CACHE_TAGS } from '@/lib/cache';

type Messages = Record<string, unknown>;

function applyOverrides(base: Messages, overrides: Record<string, string>): Messages {
  const result = { ...base };
  for (const [key, value] of Object.entries(overrides)) {
    const parts = key.split('.');
    let current: Record<string, unknown> = result;
    for (let i = 0; i < parts.length - 1; i++) {
      if (typeof current[parts[i]] !== 'object') current[parts[i]] = {};
      current = current[parts[i]] as Record<string, unknown>;
    }
    current[parts[parts.length - 1]] = value;
  }
  return result;
}

// Overrides editados desde el panel de admin (cacheados 12 h; el panel vacía la caché al guardar)
const getOverrides = unstable_cache(
  async (locale: string) => {
    const rows = await db.translation.findMany({ where: { locale } });
    return Object.fromEntries(rows.map((o) => [o.key, o.value])) as Record<string, string>;
  },
  ['translations:overrides'],
  { revalidate: CACHE_TTL, tags: [CACHE_TAGS.translations] }
);

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const baseMessages = (await import(`../../messages/${locale}.json`)).default as Messages;

  const overrideMap = await getOverrides(locale);

  const messages = applyOverrides(baseMessages, overrideMap);

  return { locale, messages };
});
