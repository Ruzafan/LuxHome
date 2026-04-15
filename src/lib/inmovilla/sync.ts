import { db } from '@/lib/db';
import { adaptInmovillaProperty, InmovillaProperty } from './adapter';

/**
 * Sincroniza una sola propiedad (webhook o cron).
 * Upsert de campos escalares + recreación de relaciones dentro de una transacción.
 */
export async function syncSingleProperty(raw: InmovillaProperty): Promise<void> {
  const { scalars, features, location, images } = adaptInmovillaProperty(raw);

  await db.$transaction(async (tx) => {
    // 1. Upsert de la propiedad (campos escalares)
    const { id: propertyId } = await tx.property.upsert({
      where:  { inmovillaId: scalars.inmovillaId },
      create: scalars,
      update: scalars,
      select: { id: true },
    });

    // 2. Recrea las relaciones (borrar + insertar)
    await tx.propertyFeatures.deleteMany({ where: { propertyId } });
    await tx.propertyLocation.deleteMany({ where: { propertyId } });
    await tx.propertyImage.deleteMany({ where: { propertyId } });

    await tx.propertyFeatures.create({ data: { propertyId, ...features } });
    await tx.propertyLocation.create({ data: { propertyId, ...location } });

    if (images.length > 0) {
      await tx.propertyImage.createMany({
        data: images.map((img) => ({ propertyId, ...img })),
      });
    }
  });
}

/**
 * Sincronización completa: obtiene todas las propiedades de Inmovilla,
 * hace upsert de cada una y desactiva las que ya no aparecen.
 */
export async function syncAllProperties(): Promise<{
  created: number;
  updated: number;
  deactivated: number;
}> {
  const apiUrl = process.env.INMOVILLA_API_URL!;
  const apiKey = process.env.INMOVILLA_API_KEY!;

  const response = await fetch(`${apiUrl}/propiedades`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Inmovilla API error: ${response.status} ${response.statusText}`);
  }

  const remoteProperties: InmovillaProperty[] = await response.json();
  const remoteIds = new Set(remoteProperties.map((p) => String(p.id)));

  let created = 0;
  let updated = 0;

  for (const raw of remoteProperties) {
    const existing = await db.property.findUnique({
      where:  { inmovillaId: String(raw.id) },
      select: { id: true },
    });
    await syncSingleProperty(raw);
    existing ? updated++ : created++;
  }

  const { count: deactivated } = await db.property.updateMany({
    where: {
      inmovillaId: { notIn: Array.from(remoteIds) },
      status: { in: ['disponible', 'reservado'] },
    },
    data: { status: 'vendido' },
  });

  return { created, updated, deactivated };
}
