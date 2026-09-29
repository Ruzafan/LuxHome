import { NextRequest, NextResponse, after } from 'next/server';
import { db } from '@/lib/db';
import { notifyNewLead } from '@/lib/notify';
import { isSpam, parseAttribution } from '@/lib/leads';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    if (isSpam(body)) return NextResponse.json({ ok: true });

    const str = (key: string, max: number) => {
      const v = body[key];
      return typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null;
    };
    const nombre = str('nombre', 100);
    const email = str('email', 160);
    const mensaje = str('mensaje', 5000);
    const asunto = str('asunto', 60);
    const propertyRef = str('_propertyRef', 60) ?? str('ref', 60);

    if (!nombre || !email || !mensaje) {
      return NextResponse.json({ error: 'Faltan campos obligatorios.' }, { status: 400 });
    }

    // Guardar lead en BD (aunque el email falle, el lead queda registrado)
    const lead = await db.lead.create({
      data: {
        kind: propertyRef ? 'propiedad' : asunto === 'valoracion' || asunto === 'vender' ? 'valoracion' : 'contacto',
        nombre,
        apellidos: str('apellidos', 100),
        email,
        telefono: str('telefono', 30),
        asunto,
        presupuesto: str('presupuesto', 60),
        mensaje,
        propertyRef,
        locale: request.headers.get('accept-language')?.slice(0, 2) ?? 'es',
        ...parseAttribution(body),
      },
    });

    after(async () => {
      await notifyNewLead(lead);
      await db.analyticsEvent
        .create({ data: { type: 'contact_submit', path: lead.sourcePath ?? '/contacto', meta: { kind: lead.kind } } })
        .catch(() => {});
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[contact]', err);
    return NextResponse.json({ error: 'No se pudo enviar el mensaje.' }, { status: 500 });
  }
}
