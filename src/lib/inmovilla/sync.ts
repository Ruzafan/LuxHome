import { db } from '@/lib/db';
import { adaptInmovillaProperty, InmovillaProperty } from './adapter';
import { fetchPropertyList, fetchProperty } from './client';
import { fetchXmlProperties } from './xmlClient';

/**
 * Sincroniza una sola propiedad (webhook o cron).
 * Upsert de campos escalares + recreación de relaciones dentro de una transacción.
 */
export async function syncSingleProperty(raw: InmovillaProperty): Promise<void> {
  const { scalars, features, location, images } = adaptInmovillaProperty(raw);

  await db.$transaction(async (tx) => {
    const { id: propertyId } = await tx.property.upsert({
      where:  { inmovillaId: scalars.inmovillaId },
      create: scalars,
      update: scalars,
      select: { id: true },
    });

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

// ─── Sync vía feed XML (recomendado) ──────────────────────────────────────────

/**
 * Sincronización completa a partir del feed XML diario de Inmovilla.
 *
 * Un solo request HTTP descarga todas las propiedades activas.
 * Hace upsert de cada una y desactiva las que ya no aparecen en el XML.
 *
 * Requiere: INMOVILLA_XML_URL en .env
 */
export async function syncFromXml(): Promise<{
  created:     number;
  updated:     number;
  deactivated: number;
}> {
  if (!process.env.INMOVILLA_XML_URL) {
    throw new Error('INMOVILLA_XML_URL no está definida. Configúrala en .env para activar la sync.');
  }

  const properties = await fetchXmlProperties();
  const remoteIds = new Set(properties.map((p) => String(p.id)));

  // Carga los IDs locales de una vez para saber si son nuevos o actualizados
  const localRows = await db.property.findMany({
    where:  { inmovillaId: { in: Array.from(remoteIds) } },
    select: { inmovillaId: true },
  });
  const localIds = new Set(localRows.map((r) => r.inmovillaId));

  let created  = 0;
  let updated  = 0;

  for (const prop of properties) {
    const isNew = !localIds.has(String(prop.id));
    await syncSingleProperty(prop);
    isNew ? created++ : updated++;
  }

  const { count: deactivated } = await db.property.updateMany({
    where: {
      inmovillaId: { notIn: Array.from(remoteIds) },
      status:      { in: ['disponible', 'reservado'] },
    },
    data: { status: 'vendido' },
  });

  return { created, updated, deactivated };
}

// ─── Sync vía API REST v1 (alternativa) ───────────────────────────────────────

/**
 * Sincronización completa contra la API REST v1 de Inmovilla.
 *
 * Compara fechaact local vs. remoto para descargar solo las propiedades
 * que han cambiado desde la última sync. Respeta el rate limit de la API
 * (pausa configurable con INMOVILLA_SYNC_DELAY_MS, default 12 000 ms).
 *
 * Requiere: INMOVILLA_TOKEN en .env
 */
export async function syncAllProperties(): Promise<{
  created:     number;
  updated:     number;
  deactivated: number;
  skipped:     number;
}> {
  if (!process.env.INMOVILLA_TOKEN) {
    throw new Error('INMOVILLA_TOKEN no está definido. Configúralo en .env para activar la sync.');
  }

  const delayMs = parseInt(process.env.INMOVILLA_SYNC_DELAY_MS ?? '12000', 10);

  const list = await fetchPropertyList();
  const remoteIds = new Set(list.map((p) => String(p.cod_ofer)));

  const localRows = await db.property.findMany({
    where:  { inmovillaId: { in: Array.from(remoteIds) } },
    select: { inmovillaId: true, updatedAt: true },
  });
  const localMap = new Map(localRows.map((r) => [r.inmovillaId, r.updatedAt]));

  let created  = 0;
  let updated  = 0;
  let skipped  = 0;
  let callCount = 0;

  for (const item of list) {
    const idStr    = String(item.cod_ofer);
    const localTs  = localMap.get(idStr);
    const remoteTs = new Date(item.fechaact);

    if (localTs && localTs >= remoteTs) {
      skipped++;
      continue;
    }

    if (callCount > 0) await new Promise((r) => setTimeout(r, delayMs));
    callCount++;

    const normalized = await fetchProperty(item.cod_ofer);
    if (!normalized) continue;

    const isNew = !localTs;
    await syncSingleProperty(normalized);
    isNew ? created++ : updated++;
  }

  const { count: deactivated } = await db.property.updateMany({
    where: {
      inmovillaId: { notIn: Array.from(remoteIds) },
      status:      { in: ['disponible', 'reservado'] },
    },
    data: { status: 'vendido' },
  });

  return { created, updated, deactivated, skipped };
}
