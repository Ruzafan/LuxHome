/** Utilidades comunes a los formularios que generan leads. */

export interface Attribution {
  sourcePath: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
}

const clip = (v: unknown, max = 120) => {
  const s = typeof v === 'string' ? v.trim() : '';
  return s ? s.slice(0, max) : null;
};

/** Los formularios envían { _attribution: { path, utm_source, ... } } (ver lib/track.ts) */
export function parseAttribution(body: Record<string, unknown>): Attribution {
  const a = (body._attribution ?? {}) as Record<string, unknown>;
  return {
    sourcePath: clip(a.path, 300),
    utmSource: clip(a.utm_source),
    utmMedium: clip(a.utm_medium),
    utmCampaign: clip(a.utm_campaign),
  };
}

/** Campo trampa invisible: los bots lo rellenan, las personas no */
export const HONEYPOT_FIELD = 'empresa_web';

export function isSpam(body: Record<string, unknown>): boolean {
  return typeof body[HONEYPOT_FIELD] === 'string' && body[HONEYPOT_FIELD] !== '';
}

export const LEAD_STATUSES = {
  nueva: 'Nueva',
  contactada: 'Contactada',
  visita: 'Visita concertada',
  captada: 'Captada',
  descartada: 'Descartada',
} as const;

export type LeadStatus = keyof typeof LEAD_STATUSES;

export const LEAD_KINDS = {
  valoracion: 'Valoración',
  propiedad: 'Inmueble',
  contacto: 'Contacto',
} as const;
