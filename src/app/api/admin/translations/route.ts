import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth';
import { db } from '@/lib/db';

async function authenticate(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return !!token && (await verifySessionToken(token));
}

// GET /api/admin/translations?locale=es
export async function GET(req: NextRequest) {
  if (!(await authenticate())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const locale = req.nextUrl.searchParams.get('locale') ?? 'es';
  const translations = await db.translation.findMany({
    where: { locale },
    orderBy: { key: 'asc' },
  });

  return NextResponse.json(translations);
}

// POST /api/admin/translations — upsert a single key
export async function POST(req: NextRequest) {
  if (!(await authenticate())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { locale, key, value } = await req.json();
  if (!locale || !key || value === undefined) {
    return NextResponse.json({ error: 'locale, key and value are required' }, { status: 400 });
  }

  const translation = await db.translation.upsert({
    where: { locale_key: { locale, key } },
    update: { value },
    create: { locale, key, value },
  });

  return NextResponse.json(translation);
}

// DELETE /api/admin/translations — remove an override (falls back to JSON default)
export async function DELETE(req: NextRequest) {
  if (!(await authenticate())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { locale, key } = await req.json();
  if (!locale || !key) {
    return NextResponse.json({ error: 'locale and key are required' }, { status: 400 });
  }

  await db.translation.deleteMany({ where: { locale, key } });
  return NextResponse.json({ ok: true });
}
