import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { syncSingleProperty } from '@/lib/inmovilla/sync';
import { InmovillaProperty } from '@/lib/inmovilla/adapter';

/**
 * POST /api/inmovilla/webhook
 *
 * Inmovilla llama a este endpoint cada vez que una propiedad
 * se crea, modifica o elimina en su sistema.
 *
 * Configurar en Inmovilla:
 *   URL del webhook: https://tu-dominio.com/api/inmovilla/webhook
 *   Secret:         El valor de INMOVILLA_WEBHOOK_SECRET en .env
 */
export async function POST(req: NextRequest) {
  // 1. Verificar el secret para que solo Inmovilla pueda llamar a este endpoint
  const secret = req.headers.get('x-inmovilla-secret');
  if (secret !== process.env.INMOVILLA_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { evento: string; propiedad: InmovillaProperty };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { evento, propiedad } = body;
  let propertiesUpdated = 0;
  let propertiesCreated = 0;
  let propertiesDeleted = 0;

  try {
    if (evento === 'propiedad.eliminada') {
      // Marca como vendida/alquilada en lugar de borrar físicamente
      await db.property.update({
        where: { inmovillaId: String(propiedad.id) },
        data:  { status: propiedad.tipo_operacion === 'alquiler' ? 'alquilado' : 'vendido' },
      });
      propertiesDeleted = 1;
    } else {
      // propiedad.creada | propiedad.modificada
      const existing = await db.property.findUnique({
        where: { inmovillaId: String(propiedad.id) },
        select: { id: true },
      });
      await syncSingleProperty(propiedad);
      existing ? propertiesUpdated++ : propertiesCreated++;
    }

    // Registrar el evento en el log de sincronización
    await db.syncLog.create({
      data: {
        source:             'webhook',
        status:             'ok',
        message:            `Evento: ${evento} — propiedad ${propiedad.id}`,
        propertiesUpdated,
        propertiesCreated,
        propertiesDeleted,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    await db.syncLog.create({
      data: {
        source:  'webhook',
        status:  'error',
        message: err instanceof Error ? err.message : 'Unknown error',
      },
    });

    console.error('[Webhook Inmovilla]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
