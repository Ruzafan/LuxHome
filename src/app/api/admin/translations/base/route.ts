import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth';

async function authenticate(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return !!token && (await verifySessionToken(token));
}

// GET /api/admin/translations/base?locale=es — returns the raw JSON file
export async function GET(req: NextRequest) {
  if (!(await authenticate())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const locale = req.nextUrl.searchParams.get('locale') ?? 'es';
  const allowed = ['es', 'ca', 'en'];
  if (!allowed.includes(locale)) {
    return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });
  }

  try {
    const messages = (await import(`../../../../../../messages/${locale}.json`)).default;
    return NextResponse.json(messages);
  } catch {
    return NextResponse.json({ error: 'Messages file not found' }, { status: 404 });
  }
}
