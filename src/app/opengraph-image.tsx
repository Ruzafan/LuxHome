import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'LuxHome — Inmobiliaria en el Vallès Occidental';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'var(--navy)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'serif',
        }}
      >
        {/* Gold accent line */}
        <div style={{ width: 80, height: 3, background: 'var(--gold)', marginBottom: 32 }} />

        <div style={{ color: 'var(--gold)', fontSize: 18, letterSpacing: 8, textTransform: 'uppercase', marginBottom: 20 }}>
          Inmobiliaria
        </div>

        <div style={{ color: '#ffffff', fontSize: 72, fontWeight: 700, marginBottom: 16, textAlign: 'center' }}>
          LuxHome
        </div>

        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 24, textAlign: 'center', maxWidth: 600 }}>
          Compra, vende o alquila en el Vallès Occidental
        </div>

        {/* Gold accent line */}
        <div style={{ width: 80, height: 3, background: 'var(--gold)', marginTop: 32 }} />

        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, marginTop: 24 }}>
          luxhomein.com · +34 691 294 443
        </div>
      </div>
    ),
    { ...size }
  );
}
