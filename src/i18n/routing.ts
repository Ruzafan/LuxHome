import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['es'],
  defaultLocale: 'es',
  localePrefix: 'never', // sin prefijo de idioma en las URLs
});

export type Locale = (typeof routing.locales)[number];
