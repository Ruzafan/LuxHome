'use client';

/**
 * Analítica propia (cliente). Sin cookies ni identificadores: solo se guarda en sessionStorage
 * la campaña (utm) con la que llegó el visitante, para atribuir los leads de esa visita.
 */

const UTM_KEY = 'luxhome_utm';
const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign'] as const;

type Utm = Partial<Record<(typeof UTM_PARAMS)[number], string>>;

function readUtm(): Utm {
  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl: Utm = {};
    for (const key of UTM_PARAMS) {
      const v = params.get(key);
      if (v) fromUrl[key] = v;
    }
    if (Object.keys(fromUrl).length) {
      sessionStorage.setItem(UTM_KEY, JSON.stringify(fromUrl));
      return fromUrl;
    }
    return JSON.parse(sessionStorage.getItem(UTM_KEY) ?? '{}') as Utm;
  } catch {
    return {};
  }
}

// Navegadores automatizados (tests, scrapers) no cuentan
const isAutomated = () => typeof navigator !== 'undefined' && navigator.webdriver;

export function track(type: string, meta?: Record<string, unknown>) {
  if (typeof window === 'undefined' || isAutomated()) return;
  const payload = JSON.stringify({
    type,
    path: window.location.pathname,
    referrer: document.referrer || undefined,
    ...readUtm(),
    ...(meta ? { meta } : {}),
  });
  try {
    if (!navigator.sendBeacon?.('/api/track', new Blob([payload], { type: 'text/plain' }))) {
      void fetch('/api/track', { method: 'POST', body: payload, keepalive: true });
    }
  } catch {}
}

/** Datos de origen que los formularios adjuntan al lead */
export function getAttribution() {
  if (typeof window === 'undefined') return {};
  return { path: window.location.pathname, ...readUtm() };
}
