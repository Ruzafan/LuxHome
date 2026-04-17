import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { syncFromXml, syncAllProperties } from '@/lib/inmovilla/sync';

/**
 * GET /api/sync
 *
 * Sincronización completa con Inmovilla.
 * Se invoca:
 *   - Automáticamente cada noche (Vercel Cron, ver vercel.json)
 *   - Manualmente por el administrador con la cabecera Authorization correcta
 *
 * Protegido con CRON_SECRET para que nadie externo pueda dispararlo.
 *
 * Prioridad de método:
 *   1. Feed XML  → si INMOVILLA_XML_URL está definida (recomendado)
 *   2. API REST  → si INMOVILLA_TOKEN está definida
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const start = Date.now();
  const source = process.env.INMOVILLA_XML_URL ? 'xml' : 'api';

  try {
    const stats =
      source === 'xml'
        ? { ...(await syncFromXml()), skipped: 0 }
        : await syncAllProperties();

    const elapsed = Date.now() - start;

    await db.syncLog.create({
      data: {
        source:            'cron',
        status:            'ok',
        message:           `[${source.toUpperCase()}] Sync completada en ${elapsed}ms`,
        propertiesCreated: stats.created,
        propertiesUpdated: stats.updated,
        propertiesDeleted: stats.deactivated,
      },
    });

    return NextResponse.json({ ok: true, source, ...stats, ms: elapsed });
  } catch (err) {
    await db.syncLog.create({
      data: {
        source:  'cron',
        status:  'error',
        message: err instanceof Error ? err.message : 'Unknown error',
      },
    });

    console.error('[Sync Cron]', err);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
