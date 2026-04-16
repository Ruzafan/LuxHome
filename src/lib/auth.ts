/**
 * Auth helpers — sesión de admin con HMAC-SHA256 + cookie httpOnly.
 * Usa Web Crypto API (disponible en Edge y Node.js).
 */

export const SESSION_COOKIE = 'admin_session';
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

async function getHmacKey(usage: 'sign' | 'verify'): Promise<CryptoKey> {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error('ADMIN_SECRET env var no configurado');
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    [usage],
  );
}

/** Crea un token firmado con expiración de 24h. */
export async function createSessionToken(): Promise<string> {
  const payload = JSON.stringify({ exp: Date.now() + TOKEN_TTL_MS });
  const payloadB64 = btoa(payload);
  const key = await getHmacKey('sign');
  const sigBuf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadB64));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sigBuf)));
  return `${payloadB64}.${sigB64}`;
}

/** Verifica firma y expiración. Devuelve true si el token es válido. */
export async function verifySessionToken(token: string): Promise<boolean> {
  const dot = token.indexOf('.');
  if (dot === -1) return false;
  const payloadB64 = token.slice(0, dot);
  const sigB64 = token.slice(dot + 1);
  try {
    const payload = JSON.parse(atob(payloadB64));
    if (!payload.exp || payload.exp < Date.now()) return false;
    const key = await getHmacKey('verify');
    const sig = Uint8Array.from(atob(sigB64), (c) => c.charCodeAt(0));
    return await crypto.subtle.verify('HMAC', key, sig, new TextEncoder().encode(payloadB64));
  } catch {
    return false;
  }
}
