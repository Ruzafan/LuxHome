import { revalidateTag } from 'next/cache';

/** Tiempo que se guardan en caché las lecturas públicas de la BD: 12 h */
export const CACHE_TTL = 60 * 60 * 12;

export const CACHE_TAGS = {
  properties: 'properties',
  translations: 'translations',
} as const;

/**
 * Vacía la caché de inmuebles al momento. Llamar tras cualquier escritura
 * (sync, webhook, panel admin) para que la web no espere a que pasen las 12 h.
 */
export function invalidatePropertiesCache() {
  revalidateTag(CACHE_TAGS.properties, { expire: 0 });
}

export function invalidateTranslationsCache() {
  revalidateTag(CACHE_TAGS.translations, { expire: 0 });
}
