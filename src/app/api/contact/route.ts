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

    // Email interno a la agencia + email de confirmación al usuario (en paralelo)
    await Promise.all([
      // Email a la agencia
      resend.emails.send({
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
      }),

      // Email de confirmación al usuario
      resend.emails.send({
        from: 'LuxHome <onboarding@resend.dev>',
        to: email,
        subject: 'Hemos recibido tu mensaje — LuxHome',
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
            <div style="background:#0f1f3d;padding:24px 32px;border-radius:8px 8px 0 0">
              <img src="https://luxhomein.com/logo.png" alt="LuxHome" style="height:44px;width:auto" />
            </div>
            <div style="background:#fff;padding:40px 32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
              <h2 style="color:#0f1f3d;margin:0 0 8px;font-size:22px">Hola, ${nombre} 👋</h2>
              <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px">
                Hemos recibido tu mensaje y te responderemos en menos de <strong>24 horas</strong>.
              </p>
              ${_propertyRef ? `
              <div style="background:#faf8f3;border-left:3px solid #c9a84c;padding:12px 16px;border-radius:0 8px 8px 0;margin:0 0 24px;font-size:14px;color:#6b7280">
                Tu consulta hace referencia a la propiedad <strong style="color:#0f1f3d">${_propertyRef}</strong>.
              </div>` : ''}
              <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 24px">
                Mientras tanto, puedes explorar más propiedades en nuestra web o contactarnos directamente:
              </p>
              <div style="display:flex;gap:12px;margin:0 0 32px">
                <a href="https://luxhomein.com/propiedades"
                   style="display:inline-block;padding:12px 20px;background:#0f1f3d;color:#fff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600">
                  Ver propiedades
                </a>
                <a href="https://wa.me/34691294443"
                   style="display:inline-block;padding:12px 20px;background:#25d366;color:#fff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600">
                  WhatsApp
                </a>
              </div>
              <div style="border-top:1px solid #e5e7eb;padding-top:20px;font-size:13px;color:#9ca3af">
                <p style="margin:0 0 4px"><strong style="color:#374151">LuxHome Inmobiliaria</strong></p>
                <p style="margin:0 0 2px">Rambla 27, 08130 Santa Perpètua de Mogoda</p>
                <p style="margin:0 0 2px">📞 <a href="tel:+34691294443" style="color:#c9a84c;text-decoration:none">+34 691 294 443</a></p>
                <p style="margin:0">✉️ <a href="mailto:bego@luxhomein.com" style="color:#c9a84c;text-decoration:none">bego@luxhomein.com</a></p>
              </div>
            </div>
          </div>
        `,
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[contact]', err);
    return NextResponse.json({ error: 'No se pudo enviar el mensaje.' }, { status: 500 });
  }
}
