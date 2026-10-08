import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import type { Lead } from '@prisma/client';
import type { ValuationData } from '@/lib/valuation';

/**
 * Avisos cuando entra un lead:
 *   1. Email a la agencia (LEADS_NOTIFY_EMAILS)
 *   2. Email de confirmación al cliente (si dejó email)
 *   3. WhatsApp a la agencia vía CallMeBot (WHATSAPP_NOTIFY), opcional
 *
 * Nunca lanza: un fallo de envío no debe perder el lead, que ya está guardado en BD.
 */

const SITE_URL = process.env.SITE_URL ?? 'https://luxhomein.com';
// Con SMTP (Gmail) el remitente es la propia cuenta SMTP_USER: Gmail reescribe cualquier otro From.
// Con Resend, onboarding@resend.dev solo entrega al propietario de la cuenta: hay que verificar
// luxhomein.com en Resend y definir EMAIL_FROM para que llegue al equipo.
const EMAIL_FROM = process.env.SMTP_USER
  ? `LuxHome <${process.env.SMTP_USER}>`
  : process.env.EMAIL_FROM ?? 'LuxHome <onboarding@resend.dev>';
const AGENCY_PHONE = '+34 691 294 443';

const KIND_LABEL: Record<string, string> = {
  valoracion: 'Solicitud de valoración',
  propiedad: 'Consulta sobre un inmueble',
  contacto: 'Mensaje de contacto',
};

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Destino anterior, se mantiene mientras LEADS_NOTIFY_EMAILS no esté configurada
const FALLBACK_NOTIFY_EMAIL = 'marcramiro@gmail.com';

function notifyEmails(): string[] {
  const list = (process.env.LEADS_NOTIFY_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);
  if (list.length === 0) {
    console.warn(`[notify] LEADS_NOTIFY_EMAILS vacía: el aviso va solo a ${FALLBACK_NOTIFY_EMAIL}`);
    return [FALLBACK_NOTIFY_EMAIL];
  }
  return list;
}

const eur = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

function valuationRows(v: ValuationData): [string, string][] {
  const rows: [string, string][] = [
    ['Municipio', v.city],
    ['Dirección', v.address || 'No indicada'],
    ['Tipo', v.typeLabel],
    ['Superficie', `${v.area} m²`],
    ['Habitaciones / baños', `${v.bedrooms} / ${v.bathrooms}`],
    ['Estado', v.conditionLabel],
    ['Extras', v.extrasLabels.length ? v.extrasLabels.join(', ') : 'Ninguno'],
    ['Plazo de venta', v.timingLabel],
  ];
  if (v.estimate) {
    rows.push([
      'Horquilla orientativa (interna)',
      `${eur(v.estimate.min)} - ${eur(v.estimate.max)} (${v.estimate.comparables} comparables, ${v.estimate.basis})`,
    ]);
  } else {
    rows.push(['Horquilla orientativa', 'Sin comparables suficientes: valorar manualmente']);
  }
  return rows;
}

function agencyEmailHtml(lead: Lead): string {
  const v = lead.valuation as ValuationData | null;
  const rows: [string, string][] = [
    ['Nombre', `${lead.nombre}${lead.apellidos ? ` ${lead.apellidos}` : ''}`],
    ['Teléfono', lead.telefono ?? 'No indicado'],
    ['Email', lead.email ?? 'No indicado'],
  ];
  if (lead.propertyRef) rows.push(['Inmueble', lead.propertyRef]);
  if (lead.asunto && lead.kind !== 'valoracion') rows.push(['Motivo', lead.asunto]);
  if (lead.presupuesto) rows.push(['Presupuesto', lead.presupuesto]);
  if (v) rows.push(...valuationRows(v));
  if (lead.sourcePath) rows.push(['Página', lead.sourcePath]);
  if (lead.utmSource) rows.push(['Campaña', [lead.utmSource, lead.utmMedium, lead.utmCampaign].filter(Boolean).join(' / ')]);

  const tableRows = rows
    .map(
      ([k, val]) =>
        `<tr><td style="padding:8px 0;color:#6b5b63;width:170px;vertical-align:top">${escapeHtml(k)}</td><td style="padding:8px 0;color:#21181d">${escapeHtml(val)}</td></tr>`
    )
    .join('');

  const callLink = lead.telefono
    ? `<a href="tel:${escapeHtml(lead.telefono.replace(/\s/g, ''))}" style="display:inline-block;padding:12px 20px;background:#21181d;color:#fff;text-decoration:none;border-radius:999px;font-size:14px;margin-right:8px">Llamar ahora</a>`
    : '';

  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#21181d">
    <div style="background:#21181d;padding:24px 32px;border-radius:16px 16px 0 0">
      <p style="color:#deaec2;margin:0 0 4px;font-size:13px">${escapeHtml(KIND_LABEL[lead.kind] ?? 'Nuevo lead')}</p>
      <h1 style="color:#fff;margin:0;font-size:22px;font-weight:normal">${escapeHtml(lead.nombre)}${lead.city ? ` · ${escapeHtml(lead.city)}` : ''}</h1>
    </div>
    <div style="background:#fff;padding:28px 32px;border:1px solid #eee;border-top:none;border-radius:0 0 16px 16px">
      <table style="width:100%;border-collapse:collapse;font-size:14px">${tableRows}</table>
      ${lead.mensaje && lead.kind !== 'valoracion' ? `<p style="margin:20px 0 0;padding:16px;background:#f6e9ef;border-radius:12px;white-space:pre-wrap;font-size:14px">${escapeHtml(lead.mensaje)}</p>` : ''}
      <div style="margin-top:24px">
        ${callLink}
        <a href="${SITE_URL}/admin/solicitudes?id=${lead.id}" style="display:inline-block;padding:12px 20px;background:#deaec2;color:#21181d;text-decoration:none;border-radius:999px;font-size:14px">Abrir en el panel</a>
      </div>
    </div>
  </div>`;
}

function customerEmailHtml(lead: Lead): string {
  const v = lead.valuation as ValuationData | null;
  const intro =
    lead.kind === 'valoracion' && v
      ? `Hemos recibido tu solicitud de valoración de tu ${escapeHtml(v.typeLabel.toLowerCase())} en ${escapeHtml(v.city)}. Una de nuestras asesoras te llamará en menos de 24 horas para concretar una visita y darte una valoración precisa, sin compromiso.`
      : 'Hemos recibido tu mensaje y te responderemos en menos de 24 horas.';

  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#21181d">
    <div style="background:#21181d;padding:24px 32px;border-radius:16px 16px 0 0">
      <img src="${SITE_URL}/logo.png" alt="LuxHome" style="height:40px;width:auto;filter:brightness(0) invert(1)" />
    </div>
    <div style="background:#fff;padding:32px;border:1px solid #eee;border-top:none;border-radius:0 0 16px 16px">
      <h2 style="margin:0 0 12px;font-size:22px;font-weight:normal">Hola, ${escapeHtml(lead.nombre)}</h2>
      <p style="font-size:15px;line-height:1.6;margin:0 0 20px;color:#3d3238">${intro}</p>
      <p style="font-size:14px;line-height:1.6;margin:0 0 20px;color:#6b5b63">Si lo prefieres, puedes escribirnos o llamarnos directamente:</p>
      <a href="https://wa.me/34691294443" style="display:inline-block;padding:12px 20px;background:#1f9d55;color:#fff;text-decoration:none;border-radius:999px;font-size:14px;margin-right:8px">WhatsApp</a>
      <a href="tel:+34691294443" style="display:inline-block;padding:12px 20px;background:#21181d;color:#fff;text-decoration:none;border-radius:999px;font-size:14px">${AGENCY_PHONE}</a>
      <p style="margin:28px 0 0;padding-top:16px;border-top:1px solid #eee;font-size:12px;color:#8a7d84">
        LuxHome Inmobiliaria · Rambla 27, 08130 Santa Perpètua de Mogoda
      </p>
    </div>
  </div>`;
}

function whatsappText(lead: Lead): string {
  const v = lead.valuation as ValuationData | null;
  const lines = [
    `*${KIND_LABEL[lead.kind] ?? 'Nuevo lead'}* (web)`,
    `${lead.nombre}${lead.telefono ? ` · ${lead.telefono}` : ''}`,
  ];
  if (v) {
    lines.push(`${v.typeLabel} ${v.area} m² en ${v.city}`);
    if (v.estimate) lines.push(`Horquilla: ${eur(v.estimate.min)} - ${eur(v.estimate.max)}`);
    lines.push(`Plazo: ${v.timingLabel}`);
  } else if (lead.propertyRef) {
    lines.push(`Inmueble ${lead.propertyRef}`);
  }
  lines.push(`${SITE_URL}/admin/solicitudes?id=${lead.id}`);
  return lines.join('\n');
}

/** WHATSAPP_NOTIFY="34600111222:apikey1,34600333444:apikey2" (CallMeBot, cada número activa su propia apikey) */
async function sendWhatsapp(text: string): Promise<void> {
  const entries = (process.env.WHATSAPP_NOTIFY ?? '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);
  await Promise.all(
    entries.map(async (entry) => {
      const [phone, apikey] = entry.split(':');
      if (!phone || !apikey) return;
      const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(apikey)}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error(`CallMeBot ${res.status} para ${phone.slice(0, 4)}***`);
    })
  );
}

type EmailMessage = { to: string | string[]; replyTo?: string; subject: string; html: string };

/**
 * Prioridad: SMTP (SMTP_USER + SMTP_PASS, por defecto Gmail con contraseña de aplicación),
 * si no Resend (RESEND_API_KEY). Devuelve null si no hay ninguno configurado.
 */
function emailSender(): ((msg: EmailMessage) => Promise<unknown>) | null {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const port = Number(process.env.SMTP_PORT ?? 465);
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    return (msg) => transport.sendMail({ from: EMAIL_FROM, ...msg });
  }
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    return (msg) => resend.emails.send({ from: EMAIL_FROM, ...msg });
  }
  return null;
}

export async function notifyNewLead(lead: Lead): Promise<void> {
  const tasks: Promise<unknown>[] = [];
  const recipients = notifyEmails();
  const send = emailSender();

  if (!send) {
    console.warn('[notify] Ni SMTP_USER/SMTP_PASS ni RESEND_API_KEY configuradas: no se envían emails');
  } else {
    tasks.push(
      send({
        to: recipients,
        ...(lead.email ? { replyTo: lead.email } : {}),
        subject: `[LuxHome] ${KIND_LABEL[lead.kind] ?? 'Nuevo lead'}: ${lead.nombre}${lead.city ? ` (${lead.city})` : ''}`,
        html: agencyEmailHtml(lead),
      })
    );
    if (lead.email) {
      tasks.push(
        send({
          to: lead.email,
          replyTo: recipients[0],
          subject:
            lead.kind === 'valoracion'
              ? 'Hemos recibido tu solicitud de valoración | LuxHome'
              : 'Hemos recibido tu mensaje | LuxHome',
          html: customerEmailHtml(lead),
        })
      );
    }
  }

  tasks.push(sendWhatsapp(whatsappText(lead)));

  const results = await Promise.allSettled(tasks);
  for (const r of results) {
    if (r.status === 'rejected') console.error('[notify]', r.reason);
    // Resend devuelve { error } en vez de lanzar
    else if (r.value && typeof r.value === 'object' && 'error' in r.value && r.value.error) {
      console.error('[notify] Resend', r.value.error);
    } else if (r.value && typeof r.value === 'object' && 'rejected' in r.value) {
      // nodemailer: destinatarios rechazados por el servidor SMTP
      const rejected = (r.value as { rejected: unknown[] }).rejected;
      if (rejected.length) console.error('[notify] SMTP rechazó', rejected);
    }
  }
}
