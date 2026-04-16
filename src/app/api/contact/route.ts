import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const body = await request.json();
    const { nombre, apellidos, email, telefono, asunto, presupuesto, mensaje, _propertyRef } = body;

    if (!nombre || !email || !mensaje) {
      return NextResponse.json({ error: 'Faltan campos obligatorios.' }, { status: 400 });
    }

    // Guardar lead en BD (aunque el email falle, el lead queda registrado)
    await db.lead.create({
      data: {
        nombre,
        apellidos: apellidos || null,
        email,
        telefono: telefono || null,
        asunto: asunto || null,
        presupuesto: presupuesto || null,
        mensaje,
        propertyRef: _propertyRef || null,
        locale: request.headers.get('accept-language')?.slice(0, 2) ?? 'es',
      },
    });

    // Enviar email (best-effort — el lead ya está guardado)
    await resend.emails.send({
      from: 'LuxHome <onboarding@resend.dev>',
      to: 'marcramiro@gmail.com',
      replyTo: email,
      subject: `[LuxHome] Nuevo contacto: ${asunto || 'Sin asunto'}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
          <div style="background:#0f1f3d;padding:24px 32px;border-radius:8px 8px 0 0">
            <h1 style="color:#c9a84c;margin:0;font-size:22px">Nuevo mensaje de contacto</h1>
            <p style="color:#ffffff80;margin:4px 0 0;font-size:13px">LuxHome · luxhomein.com</p>
          </div>
          <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <tr>
                <td style="padding:8px 0;color:#6b7280;width:140px">Nombre</td>
                <td style="padding:8px 0;font-weight:600">${nombre}${apellidos ? ` ${apellidos}` : ''}</td>
              </tr>
              <tr style="border-top:1px solid #f3f4f6">
                <td style="padding:8px 0;color:#6b7280">Email</td>
                <td style="padding:8px 0"><a href="mailto:${email}" style="color:#c9a84c">${email}</a></td>
              </tr>
              ${telefono ? `
              <tr style="border-top:1px solid #f3f4f6">
                <td style="padding:8px 0;color:#6b7280">Teléfono</td>
                <td style="padding:8px 0">${telefono}</td>
              </tr>` : ''}
              ${_propertyRef ? `
              <tr style="border-top:1px solid #f3f4f6">
                <td style="padding:8px 0;color:#6b7280">Propiedad</td>
                <td style="padding:8px 0;font-weight:600;color:#c9a84c">${_propertyRef}</td>
              </tr>` : ''}
              ${asunto ? `
              <tr style="border-top:1px solid #f3f4f6">
                <td style="padding:8px 0;color:#6b7280">Motivo</td>
                <td style="padding:8px 0">${asunto}</td>
              </tr>` : ''}
              ${presupuesto ? `
              <tr style="border-top:1px solid #f3f4f6">
                <td style="padding:8px 0;color:#6b7280">Presupuesto</td>
                <td style="padding:8px 0">${presupuesto}</td>
              </tr>` : ''}
              <tr style="border-top:1px solid #f3f4f6">
                <td style="padding:12px 0;color:#6b7280;vertical-align:top">Mensaje</td>
                <td style="padding:12px 0;white-space:pre-wrap">${mensaje}</td>
              </tr>
            </table>
            <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af">
              Responde directamente a este email para contestar a ${nombre}.
            </div>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[contact]', err);
    return NextResponse.json({ error: 'No se pudo enviar el mensaje.' }, { status: 500 });
  }
}
