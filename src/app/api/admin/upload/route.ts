import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth';
import { syncSingleProperty } from '@/lib/inmovilla/sync';
import { type InmovillaProperty } from '@/lib/inmovilla/adapter';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  // Verificar sesión
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Parsear fichero
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No se ha subido ningún fichero' }, { status: 400 });
  }

  let properties: InmovillaProperty[];
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    properties = Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return NextResponse.json(
      { error: 'El fichero no es un JSON válido' },
      { status: 400 },
    );
  }

  let created = 0;
  let updated = 0;
  const errors: string[] = [];

  for (const raw of properties) {
    try {
      const existing = await db.property.findUnique({
        where: { inmovillaId: String(raw.id) },
        select: { id: true },
      });
      await syncSingleProperty(raw);
      existing ? updated++ : created++;
    } catch (e) {
      errors.push(`ID ${raw.id}: ${e instanceof Error ? e.message : 'Error desconocido'}`);
    }
  }

  await db.syncLog.create({
    data: {
      source: 'manual',
      status: errors.length === 0 ? 'ok' : 'error',
      message: errors.length > 0 ? errors.join('\n') : null,
      propertiesCreated: created,
      propertiesUpdated: updated,
      propertiesDeleted: 0,
    },
  });

  return NextResponse.json({ created, updated, errors });
}
