import { MetadataRoute } from 'next';
import { db } from '@/lib/db';

const BASE_URL = 'https://luxhomein.com';
const LOCALES = ['es', 'ca', 'en'] as const;

function localizedUrl(path: string, locale: string) {
  if (locale === 'es') return `${BASE_URL}${path}`;
  return `${BASE_URL}/${locale}${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const properties = await db.property.findMany({
    select: { id: true, updatedAt: true },
    where: { status: { not: 'vendido' } },
  });

  const staticPages = ['/', '/propiedades', '/sobre-nosotros', '/contacto'];
  const staticEntries: MetadataRoute.Sitemap = staticPages.flatMap((path) =>
    LOCALES.map((locale) => ({
      url: localizedUrl(path, locale),
      lastModified: new Date(),
      changeFrequency: path === '/' || path === '/propiedades' ? ('daily' as const) : ('monthly' as const),
      priority: path === '/' ? 1 : path === '/propiedades' ? 0.9 : 0.6,
    }))
  );

  const propertyEntries: MetadataRoute.Sitemap = properties.flatMap((p) =>
    LOCALES.map((locale) => ({
      url: localizedUrl(`/propiedades/${p.id}`, locale),
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  );

  return [...staticEntries, ...propertyEntries];
}
