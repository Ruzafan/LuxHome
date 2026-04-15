import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { syncAllProperties } from '@/lib/inmovilla/sync';

/**
 * GET /api/sync
 *
 * Sincronización completa con Inmovilla.
 * Se invoca:
 *   - Automáticamente cada noche (Vercel Cron, ver vercel.json)
 *   - Manualmente por el administrador con la cabecera Authorization correcta
 *
 * Protegido con CRON_SECRET para que nadie externo pueda dispararlo.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const start = Date.now();

  try {
    const { created, updated, deactivated } = await syncAllProperties();
    const elapsed = Date.now() - start;

    await db.syncLog.create({
      data: {
        source:             'cron',
        status:             'ok',
        message:            `Sync completada en ${elapsed}ms`,
        propertiesCreated:  created,
        propertiesUpdated:  updated,
        propertiesDeleted:  deactivated,
      },
    });

    return NextResponse.json({ ok: true, created, updated, deactivated, ms: elapsed });
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
