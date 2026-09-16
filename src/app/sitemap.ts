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

  const staticPages = [
    { path: '/', priority: 1.0, freq: 'daily' as const },
    { path: '/propiedades', priority: 0.9, freq: 'daily' as const },
    { path: '/contacto', priority: 0.8, freq: 'weekly' as const },
    { path: '/privacidad', priority: 0.3, freq: 'monthly' as const },
    { path: '/aviso-legal', priority: 0.3, freq: 'monthly' as const },
    { path: '/cookies', priority: 0.3, freq: 'monthly' as const },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.flatMap(({ path, priority, freq }) =>
    LOCALES.map((locale) => ({
      url: localizedUrl(path, locale),
      lastModified: new Date(),
      changeFrequency: freq,
      priority,
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

  const llmEntries: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/llms.txt`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/llms-full.txt`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    },
  ];

  return [...staticEntries, ...propertyEntries, ...llmEntries];
}
