import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth';
import { db } from '@/lib/db';
import { LEAD_STATUSES } from '@/lib/leads';

async function isAuthorized(): Promise<boolean> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return !!token && (await verifySessionToken(token));
}

/** PATCH /api/admin/leads/:id  { status?, notes? } */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { status?: unknown; notes?: unknown };
  const data: { status?: string; notes?: string | null } = {};

  if (body.status !== undefined) {
    if (typeof body.status !== 'string' || !(body.status in LEAD_STATUSES)) {
      return NextResponse.json({ error: 'Estado no válido' }, { status: 400 });
    }
    data.status = body.status;
  }
  if (body.notes !== undefined) {
    data.notes = typeof body.notes === 'string' && body.notes.trim() ? body.notes.slice(0, 5000) : null;
  }

  try {
    const lead = await db.lead.update({ where: { id }, data, select: { id: true, status: true, notes: true, updatedAt: true } });
    return NextResponse.json(lead);
  } catch {
    return NextResponse.json({ error: 'Solicitud no encontrada' }, { status: 404 });
  }
}

/** DELETE /api/admin/leads/:id  Borrado definitivo (pruebas o solicitudes ya gestionadas) */
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await params;
  try {
    await db.lead.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Solicitud no encontrada' }, { status: 404 });
  }
}
