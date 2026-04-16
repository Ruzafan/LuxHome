import { MetadataRoute } from 'next';
import { db } from '@/lib/db';

const BASE_URL = 'https://luxhomein.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const properties = await db.property.findMany({
    select: { id: true, updatedAt: true },
  });

  const propertyEntries: MetadataRoute.Sitemap = properties.map((p) => ({
    url: `${BASE_URL}/propiedades/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/propiedades`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/sobre-nosotros`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/contacto`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...propertyEntries,
  ];
}
