import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth';
import { syncFromXml, syncAllProperties } from '@/lib/inmovilla/sync';
import { db } from '@/lib/db';

export async function POST() {
  // Verificar sesión
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const stats = process.env.INMOVILLA_XML_URL
      ? { ...(await syncFromXml()), skipped: 0 }
      : await syncAllProperties();

    await db.syncLog.create({
      data: {
        source: 'manual',
        status: 'ok',
        propertiesCreated: stats.created,
        propertiesUpdated: stats.updated,
        propertiesDeleted: stats.deactivated,
      },
    });

    return NextResponse.json(stats);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error desconocido';

    await db.syncLog.create({
      data: {
        source: 'manual',
        status: 'error',
        message,
        propertiesCreated: 0,
        propertiesUpdated: 0,
        propertiesDeleted: 0,
      },
    });

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
