import { NextRequest, NextResponse, after } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/track (navigator.sendBeacon desde components/analytics/Tracker)
 * Analítica propia sin cookies: no guarda IP, user agent ni identificador de visitante.
 */

const ALLOWED_TYPES = new Set([
  'pageview',
  'valuation_start',
  'valuation_step',
  'phone_click',
  'whatsapp_click',
]);

const BOT_UA = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|vercel-screenshot/i;

const clip = (v: unknown, max = 120) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);

function referrerHost(ref: unknown, ownHost: string | null): string | null {
  if (typeof ref !== 'string' || !ref) return null;
  try {
    const host = new URL(ref).hostname.replace(/^www\./, '');
    return host && host !== ownHost ? host : null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const ua = request.headers.get('user-agent') ?? '';
  if (!ua || BOT_UA.test(ua)) return new NextResponse(null, { status: 204 });

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(await request.text());
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const type = clip(body.type, 40);
  const path = clip(body.path, 300);
  if (!type || !ALLOWED_TYPES.has(type) || !path || !path.startsWith('/') || path.startsWith('/admin')) {
    return new NextResponse(null, { status: 204 });
  }

  const ownHost = request.nextUrl.hostname.replace(/^www\./, '');
  // meta pequeño y serializable; si es demasiado grande se descarta entero
  const metaJson = body.meta && typeof body.meta === 'object' ? JSON.stringify(body.meta) : '';
  const meta = metaJson && metaJson.length <= 500 ? JSON.parse(metaJson) : undefined;

  after(() =>
    db.analyticsEvent
      .create({
        data: {
          type,
          path,
          referrer: referrerHost(body.referrer, ownHost),
          utmSource: clip(body.utm_source),
          utmMedium: clip(body.utm_medium),
          utmCampaign: clip(body.utm_campaign),
          device: /mobile|android|iphone/i.test(ua) ? 'mobile' : 'desktop',
          ...(meta ? { meta } : {}),
        },
      })
      .catch((err) => console.error('[track]', err))
  );

  return new NextResponse(null, { status: 204 });
}
