import Link from 'next/link';
import type { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { formatPrice } from '@/lib/propertyUtils';
import type { OperationType } from '@/types/property';
import PropertyFlags from '@/components/admin/PropertyFlags';

export const dynamic = 'force-dynamic';

const FILTERS = {
  activos: 'En la web',
  reservados: 'Reservados',
  final: 'Al final',
  vendidos: 'Vendidos',
} as const;
type Filter = keyof typeof FILTERS;

type Search = { filtro?: string; q?: string };

function qs(current: Search, patch: Partial<Search>) {
  const merged = { ...current, ...patch };
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
  const s = params.toString();
  return `/admin/inmuebles${s ? `?${s}` : ''}`;
}

export default async function InmueblesPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const filter: Filter = sp.filtro && sp.filtro in FILTERS ? (sp.filtro as Filter) : 'activos';
  const q = sp.q?.trim() ?? '';

  const where: Prisma.PropertyWhereInput =
    filter === 'vendidos'   ? { status: { in: ['vendido', 'alquilado'] } } :
    filter === 'reservados' ? { status: { notIn: ['vendido', 'alquilado'] }, OR: [{ manualReserved: true }, { status: 'reservado' }] } :
    filter === 'final'      ? { status: { not: 'vendido' }, lowPriority: true } :
    { status: { not: 'vendido' } };
  if (q) {
    where.AND = {
      OR: [
        { reference: { contains: q, mode: 'insensitive' } },
        { title: { contains: q, mode: 'insensitive' } },
        { location: { city: { contains: q, mode: 'insensitive' } } },
      ],
    };
  }

  const properties = await db.property.findMany({
    where,
    include: { location: true, images: { where: { isPrimary: true }, take: 1 } },
    orderBy: [{ lowPriority: 'asc' }, { publishedAt: 'desc' }],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(FILTERS) as Filter[]).map((key) => (
            <Link
              key={key}
              href={qs(sp, { filtro: key === 'activos' ? undefined : key })}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs transition-colors ${
                filter === key ? 'bg-white text-[var(--dark)]' : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {FILTERS[key]}
            </Link>
          ))}
        </div>
        <form action="/admin/inmuebles" className="flex gap-2">
          {sp.filtro && <input type="hidden" name="filtro" value={sp.filtro} />}
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Referencia, título o municipio"
            aria-label="Buscar inmueble"
            className="w-64 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--rose)]"
          />
        </form>
      </div>

      <p className="text-xs text-white/40">
        <strong className="font-normal text-white/60">Reservado</strong>: se muestra como reservado en la web mientras siga disponible en Inmovilla; si se vende, deja de verse igualmente.{' '}
        <strong className="font-normal text-white/60">Al final</strong>: aparece detrás del resto en listados, portada y relacionados.
        La sincronización con Inmovilla no modifica estos ajustes.
      </p>

      <section className="overflow-hidden rounded-xl border border-white/10 bg-white/5" aria-label="Inmuebles">
        {properties.length === 0 ? (
          <p className="p-6 text-sm text-white/40">No hay inmuebles con estos filtros.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {properties.map((p) => {
              const sold = p.status === 'vendido' || p.status === 'alquilado';
              const img = p.images[0];
              return (
                <li key={p.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-white/10">
                    {img && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img.url} alt="" className="h-full w-full object-cover" loading="lazy" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <a
                      href={`/propiedades/${p.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate text-sm text-white hover:text-[var(--rose)]"
                    >
                      {p.title}
                    </a>
                    <p className="truncate text-xs text-white/50">
                      Ref. {p.reference}
                      {p.location?.city ? ` · ${p.location.city}` : ''}
                      {' · '}
                      {formatPrice(p.price, p.operation as OperationType)}
                      {p.status !== 'disponible' && ` · Inmovilla: ${p.status}`}
                    </p>
                  </div>
                  <PropertyFlags id={p.id} manualReserved={p.manualReserved} lowPriority={p.lowPriority} sold={sold} />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
