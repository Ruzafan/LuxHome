import { NextRequest, NextResponse, after } from 'next/server';
import { db } from '@/lib/db';
import { notifyNewLead } from '@/lib/notify';
import { isSpam, parseAttribution } from '@/lib/leads';
import { estimateValue, parseValuationInput, toValuationData } from '@/lib/valuation';

/**
 * POST /api/valuation
 * Guarda la solicitud del valorador como lead (kind = valoracion), calcula la horquilla
 * orientativa con comparables propios y avisa a la agencia tras responder.
 */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Petición no válida.' }, { status: 400 });
  }

  // Bot: respondemos como si todo fuera bien, sin guardar nada
  if (isSpam(body)) return NextResponse.json({ ok: true, estimate: null });

  const input = parseValuationInput(body);
  const nombre = String(body.nombre ?? '').trim().slice(0, 100);
  const telefono = String(body.telefono ?? '').trim().slice(0, 30);
  const email = String(body.email ?? '').trim().slice(0, 160) || null;

  if (!input || !nombre || telefono.replace(/\D/g, '').length < 9 || body.privacidad !== true) {
    return NextResponse.json({ error: 'Revisa los datos del formulario.' }, { status: 400 });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'El email no es válido.' }, { status: 400 });
  }

  try {
    const estimate = await estimateValue(input);
    const valuation = toValuationData(input, estimate);

    const lead = await db.lead.create({
      data: {
        kind: 'valoracion',
        nombre,
        email,
        telefono,
        asunto: 'valoracion',
        city: input.city,
        mensaje: `Valoración: ${valuation.typeLabel} de ${input.area} m² en ${input.city}. Plazo: ${valuation.timingLabel}.`,
        valuation: JSON.parse(JSON.stringify(valuation)),
        locale: 'es',
        ...parseAttribution(body),
      },
    });

    after(async () => {
      await notifyNewLead(lead);
      await db.analyticsEvent
        .create({ data: { type: 'valuation_submit', path: lead.sourcePath ?? '/vender-mi-inmueble', meta: { city: input.city } } })
        .catch(() => {});
    });

    return NextResponse.json({ ok: true, estimate });
  } catch (err) {
    console.error('[valuation]', err);
    return NextResponse.json({ error: 'No se pudo enviar la solicitud.' }, { status: 500 });
  }
}
