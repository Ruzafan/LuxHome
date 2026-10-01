import Link from 'next/link';
import type { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { LEAD_KINDS, LEAD_STATUSES, type LeadStatus } from '@/lib/leads';
import type { ValuationData } from '@/lib/valuation';
import LeadEditor from '@/components/admin/LeadEditor';

export const dynamic = 'force-dynamic';

const eur = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
const fmtDate = (d: Date) => d.toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Madrid' });

const STATUS_STYLE: Record<string, string> = {
  nueva: 'bg-[var(--rose)] text-[var(--dark)]',
  contactada: 'bg-white/15 text-white',
  visita: 'bg-white/15 text-white',
  captada: 'bg-white text-[var(--dark)]',
  descartada: 'bg-white/5 text-white/40',
};

type Search = { estado?: string; tipo?: string; id?: string };

function qs(current: Search, patch: Partial<Search>) {
  const merged = { ...current, ...patch };
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
  const s = params.toString();
  return `/admin/solicitudes${s ? `?${s}` : ''}`;
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs transition-colors ${
        active ? 'bg-white text-[var(--dark)]' : 'bg-white/5 text-white/60 hover:bg-white/10'
      }`}
    >
      {children}
    </Link>
  );
}

export default async function SolicitudesPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const where: Prisma.LeadWhereInput = {};
  if (sp.estado && sp.estado in LEAD_STATUSES) where.status = sp.estado;
  if (sp.tipo && sp.tipo in LEAD_KINDS) where.kind = sp.tipo;

  const [leads, selected] = await Promise.all([
    db.lead.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100 }),
    sp.id ? db.lead.findUnique({ where: { id: sp.id } }) : null,
  ]);
  const v = selected?.valuation as ValuationData | null | undefined;
  const phoneDigits = selected?.telefono?.replace(/\D/g, '') ?? '';
  const waNumber = phoneDigits.length === 9 ? `34${phoneDigits}` : phoneDigits;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs text-white/40">Estado</span>
          <Chip href={qs(sp, { estado: undefined, id: undefined })} active={!sp.estado}>Todos</Chip>
          {(Object.keys(LEAD_STATUSES) as LeadStatus[]).map((s) => (
            <Chip key={s} href={qs(sp, { estado: s, id: undefined })} active={sp.estado === s}>{LEAD_STATUSES[s]}</Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs text-white/40">Tipo</span>
          <Chip href={qs(sp, { tipo: undefined, id: undefined })} active={!sp.tipo}>Todos</Chip>
          {Object.entries(LEAD_KINDS).map(([k, label]) => (
            <Chip key={k} href={qs(sp, { tipo: k, id: undefined })} active={sp.tipo === k}>{label}</Chip>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_420px]">
        <section className="overflow-hidden rounded-xl border border-white/10 bg-white/5" aria-label="Solicitudes">
          {leads.length === 0 ? (
            <p className="p-6 text-sm text-white/40">No hay solicitudes con estos filtros.</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {leads.map((lead) => {
                const active = lead.id === selected?.id;
                return (
                  <li key={lead.id}>
                    <Link
                      href={qs(sp, { id: lead.id })}
                      scroll={false}
                      className={`flex items-center gap-4 px-5 py-4 transition ${active ? 'bg-white/10' : 'hover:bg-white/5'}`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-white">
                          {lead.nombre}{lead.apellidos ? ` ${lead.apellidos}` : ''}
                        </p>
                        <p className="truncate text-xs text-white/50">
                          {LEAD_KINDS[lead.kind as keyof typeof LEAD_KINDS] ?? lead.kind}
                          {lead.city ? ` · ${lead.city}` : lead.propertyRef ? ` · Ref. ${lead.propertyRef}` : ''}
                          {' · '}
                          {fmtDate(lead.createdAt)}
                        </p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] ${STATUS_STYLE[lead.status] ?? 'bg-white/10 text-white'}`}>
                        {LEAD_STATUSES[lead.status as LeadStatus] ?? lead.status}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          {!selected ? (
            <div className="rounded-xl border border-dashed border-white/15 p-6 text-sm text-white/40">
              Selecciona una solicitud para ver el detalle, llamar y actualizar su estado.
            </div>
          ) : (
            <div className="space-y-6 rounded-xl border border-white/10 bg-white/5 p-6">
              <div>
                <p className="text-xs text-[var(--rose)]">{LEAD_KINDS[selected.kind as keyof typeof LEAD_KINDS] ?? selected.kind}</p>
                <h2 className="mt-1 text-xl text-white">{selected.nombre}{selected.apellidos ? ` ${selected.apellidos}` : ''}</h2>
                <p className="mt-1 text-xs text-white/40">Recibida el {fmtDate(selected.createdAt)}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {selected.telefono && (
                  <a href={`tel:${phoneDigits}`} className="rounded-full bg-[var(--rose)] px-4 py-2 text-xs text-[var(--dark)]">
                    Llamar {selected.telefono}
                  </a>
                )}
                {waNumber && (
                  <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-white/10 px-4 py-2 text-xs text-white hover:bg-white/20">
                    WhatsApp
                  </a>
                )}
                {selected.email && (
                  <a href={`mailto:${selected.email}`} className="rounded-full bg-white/10 px-4 py-2 text-xs text-white hover:bg-white/20">
                    {selected.email}
                  </a>
                )}
              </div>

              {v && (
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  {[
                    ['Municipio', v.city],
                    ['Dirección', v.address || 'No indicada'],
                    ['Tipo', v.typeLabel],
                    ['Superficie', `${v.area} m²`],
                    ['Hab. / baños', `${v.bedrooms} / ${v.bathrooms}`],
                    ['Estado', v.conditionLabel],
                    ['Extras', v.extrasLabels.join(', ') || 'Ninguno'],
                    ['Plazo', v.timingLabel],
                  ].map(([k, val]) => (
                    <div key={k}>
                      <dt className="text-xs text-white/40">{k}</dt>
                      <dd className="text-white/85">{val}</dd>
                    </div>
                  ))}
                  <div className="col-span-2 rounded-lg bg-white/5 p-3">
                    <dt className="text-xs text-white/40">Horquilla orientativa (no se muestra al cliente)</dt>
                    <dd className="mt-1 text-white">
                      {v.estimate
                        ? `${eur(v.estimate.min)} - ${eur(v.estimate.max)} · ${v.estimate.pricePerM2} €/m² · ${v.estimate.comparables} comparables (${v.estimate.basis})`
                        : 'Sin comparables suficientes'}
                    </dd>
                  </div>
                </dl>
              )}

              {!v && selected.mensaje && (
                <div>
                  <p className="mb-1 text-xs text-white/40">
                    Mensaje{selected.propertyRef ? ` sobre Ref. ${selected.propertyRef}` : ''}
                  </p>
                  <p className="whitespace-pre-wrap text-sm text-white/80">{selected.mensaje}</p>
                </div>
              )}

              {(selected.sourcePath || selected.utmSource) && (
                <p className="text-xs text-white/40">
                  Origen: {selected.sourcePath ?? 'desconocido'}
                  {selected.utmSource ? ` · campaña ${[selected.utmSource, selected.utmMedium, selected.utmCampaign].filter(Boolean).join(' / ')}` : ''}
                </p>
              )}

              <LeadEditor key={selected.id} id={selected.id} status={selected.status} notes={selected.notes} />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
