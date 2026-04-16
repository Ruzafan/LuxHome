import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';
import { db } from '@/lib/db';

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

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const baseMessages = (await import(`../../messages/${locale}.json`)).default as Messages;

  // Overrides editados desde el panel de admin
  const overrides = await db.translation.findMany({ where: { locale } });
  const overrideMap: Record<string, string> = Object.fromEntries(
    overrides.map((o) => [o.key, o.value])
  );

  const messages = applyOverrides(baseMessages, overrideMap);

  return { locale, messages };
});
