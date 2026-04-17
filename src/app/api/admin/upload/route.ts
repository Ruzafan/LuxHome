import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth';
import { syncSingleProperty } from '@/lib/inmovilla/sync';
import { parseXmlProperties } from '@/lib/inmovilla/xmlClient';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  // Verificar sesión
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No se ha subido ningún fichero' }, { status: 400 });
  }

  const text = await file.text();
  let properties;

  try {
    properties = parseXmlProperties(text);
  } catch {
    return NextResponse.json(
      { error: 'El fichero no es un XML válido de Inmovilla' },
      { status: 400 },
    );
  }

  if (properties.length === 0) {
    return NextResponse.json(
      { error: 'El fichero no contiene propiedades o no tiene el formato esperado' },
      { status: 400 },
    );
  }

  const remoteIds = new Set(properties.map((p) => String(p.id)));

  // Determinar cuáles son nuevas y cuáles actualizaciones
  const localRows = await db.property.findMany({
    where:  { inmovillaId: { in: Array.from(remoteIds) } },
    select: { inmovillaId: true },
  });
  const localIds = new Set(localRows.map((r) => r.inmovillaId));

  let created = 0;
  let updated = 0;
  const errors: string[] = [];

  for (const prop of properties) {
    try {
      await syncSingleProperty(prop);
      localIds.has(String(prop.id)) ? updated++ : created++;
    } catch (e) {
      errors.push(`ID ${prop.id}: ${e instanceof Error ? e.message : 'Error desconocido'}`);
    }
  }

  // Desactivar propiedades que ya no están en el fichero subido
  const { count: deactivated } = await db.property.updateMany({
    where: {
      inmovillaId: { notIn: Array.from(remoteIds) },
      status:      { in: ['disponible', 'reservado'] },
    },
    data: { status: 'vendido' },
  });

  await db.syncLog.create({
    data: {
      source:            'manual',
      status:            errors.length === 0 ? 'ok' : 'error',
      message:           errors.length > 0 ? errors.slice(0, 5).join('\n') : `Fichero XML: ${file.name}`,
      propertiesCreated: created,
      propertiesUpdated: updated,
      propertiesDeleted: deactivated,
    },
  });

  return NextResponse.json({ created, updated, deactivated, errors });
}
