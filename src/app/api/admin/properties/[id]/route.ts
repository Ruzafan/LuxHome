import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth';
import { db } from '@/lib/db';

/** PATCH /api/admin/properties/:id  { manualReserved?, lowPriority? } */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { manualReserved?: unknown; lowPriority?: unknown };
  const data: { manualReserved?: boolean; lowPriority?: boolean } = {};
  if (typeof body.manualReserved === 'boolean') data.manualReserved = body.manualReserved;
  if (typeof body.lowPriority === 'boolean') data.lowPriority = body.lowPriority;
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 });
  }

  try {
    const property = await db.property.update({
      where: { id },
      data,
      select: { id: true, manualReserved: true, lowPriority: true },
    });
    // Las páginas por municipio se cachean 12 h; el resto de la web es dinámica
    revalidatePath('/[locale]/vender-mi-inmueble/[municipio]', 'page');
    return NextResponse.json(property);
  } catch {
    return NextResponse.json({ error: 'Inmueble no encontrado' }, { status: 404 });
  }
}
