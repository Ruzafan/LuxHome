import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSessionToken, SESSION_COOKIE } from '@/lib/auth';

export async function POST(request: Request) {
  const { username, password } = await request.json();

  const validUsername = process.env.ADMIN_USERNAME;
  const validPassword = process.env.ADMIN_PASSWORD;

  if (!validUsername || !validPassword) {
    return NextResponse.json(
      { error: 'Admin no configurado en el servidor' },
      { status: 500 },
    );
  }

  if (username !== validUsername || password !== validPassword) {
    // Pequeña espera para dificultar fuerza bruta
    await new Promise((r) => setTimeout(r, 500));
    return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
  }

  const token = await createSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24h
    path: '/',
  });

  return NextResponse.json({ ok: true });
}
