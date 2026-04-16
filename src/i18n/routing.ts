import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['es', 'ca', 'en'],
  defaultLocale: 'es',
  localePrefix: 'as-needed', // /es no tiene prefijo, /ca y /en sí
});

export type Locale = (typeof routing.locales)[number];
