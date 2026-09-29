import Link from 'next/link';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const RANGES = [7, 30, 90] as const;
const SELL_PREFIX = '/vender-mi-inmueble';
const nf = new Intl.NumberFormat('es-ES');
const pct = (part: number, whole: number) => (whole > 0 ? `${((part / whole) * 100).toFixed(1).replace('.', ',')} %` : '-');

type DayRow = { day: string; count: bigint };

async function loadStats(days: number) {
  const since = new Date(Date.now() - days * 86_400_000);
  const inRange = { createdAt: { gte: since } };

  const [
    typeCounts, sellViews, stepCounts, leadsByKind, captadas, topPages, referrers, utmSources, devices, citiesRaw,
    visitsPerDay, leadsPerDay,
  ] = await Promise.all([
    db.analyticsEvent.groupBy({ by: ['type'], where: inRange, _count: { _all: true } }),
    db.analyticsEvent.count({ where: { ...inRange, type: 'pageview', path: { startsWith: SELL_PREFIX } } }),
    db.$queryRaw<{ step: string | null; count: bigint }[]>`
      SELECT meta->>'step' AS step, count(*) AS count FROM "AnalyticsEvent"
      WHERE type = 'valuation_step' AND "createdAt" >= ${since} GROUP BY 1`,
    db.lead.groupBy({ by: ['kind'], where: inRange, _count: { _all: true } }),
    db.lead.count({ where: { ...inRange, status: 'captada' } }),
    db.analyticsEvent.groupBy({
      by: ['path'], where: { ...inRange, type: 'pageview' }, _count: { _all: true },
      orderBy: { _count: { path: 'desc' } }, take: 10,
    }),
    db.analyticsEvent.groupBy({
      by: ['referrer'], where: { ...inRange, type: 'pageview', referrer: { not: null } }, _count: { _all: true },
      orderBy: { _count: { referrer: 'desc' } }, take: 8,
    }),
    db.analyticsEvent.groupBy({
      by: ['utmSource'], where: { ...inRange, type: 'pageview', utmSource: { not: null } }, _count: { _all: true },
      orderBy: { _count: { utmSource: 'desc' } }, take: 8,
    }),
    db.analyticsEvent.groupBy({ by: ['device'], where: { ...inRange, type: 'pageview' }, _count: { _all: true } }),
    db.lead.groupBy({
      by: ['city'], where: { ...inRange, kind: 'valoracion', city: { not: null } }, _count: { _all: true },
      orderBy: { _count: { city: 'desc' } }, take: 10,
    }),
    db.$queryRaw<DayRow[]>`
      SELECT to_char("createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Madrid', 'YYYY-MM-DD') AS day, count(*) AS count
      FROM "AnalyticsEvent" WHERE type = 'pageview' AND "createdAt" >= ${since} GROUP BY 1`,
    db.$queryRaw<DayRow[]>`
      SELECT to_char("createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Madrid', 'YYYY-MM-DD') AS day, count(*) AS count
      FROM "Lead" WHERE "createdAt" >= ${since} GROUP BY 1`,
  ]);

  const byType = Object.fromEntries(typeCounts.map((t) => [t.type, t._count._all]));
  const steps = Object.fromEntries(stepCounts.map((s) => [s.step ?? '', Number(s.count)]));
  const kinds = Object.fromEntries(leadsByKind.map((k) => [k.kind, k._count._all]));

  // Serie diaria completa (días sin datos = 0)
  const visitsMap = new Map(visitsPerDay.map((r) => [r.day, Number(r.count)]));
  const leadsMap = new Map(leadsPerDay.map((r) => [r.day, Number(r.count)]));
  const series = Array.from({ length: days }, (_, i) => {
    const d = new Date(Date.now() - (days - 1 - i) * 86_400_000);
    const key = d.toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });
    return { key, visits: visitsMap.get(key) ?? 0, leads: leadsMap.get(key) ?? 0 };
  });

  const valuations = kinds.valoracion ?? 0;
  return {
    pageviews: byType.pageview ?? 0,
    sellViews,
    funnel: [
      { label: 'Visitas a páginas de venta', value: sellViews },
      { label: 'Empiezan el valorador', value: byType.valuation_start ?? 0 },
      { label: 'Llegan a "Tu inmueble"', value: steps['2'] ?? 0 },
      { label: 'Llegan a "Contacto"', value: steps['3'] ?? 0 },
      // El envío se cuenta por leads reales, no por eventos del navegador
      { label: 'Envían la solicitud', value: valuations },
    ],
    valuations,
    otherLeads: (kinds.contacto ?? 0) + (kinds.propiedad ?? 0),
    captadas,
    phoneClicks: byType.phone_click ?? 0,
    whatsappClicks: byType.whatsapp_click ?? 0,
    topPages: topPages.map((p) => ({ label: p.path, value: p._count._all })),
    sources: [
      ...utmSources.map((u) => ({ label: `Campaña: ${u.utmSource}`, value: u._count._all })),
      ...referrers.map((r) => ({ label: r.referrer ?? '', value: r._count._all })),
    ].sort((a, b) => b.value - a.value).slice(0, 10),
    devices: Object.fromEntries(devices.map((d) => [d.device ?? 'desconocido', d._count._all])),
    cities: citiesRaw.map((c) => ({ label: c.city ?? '', value: c._count._all })),
    series,
  };
}

function Tile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5">
      <p className="text-3xl text-white">{value}</p>
      <p className="mt-1 text-sm text-white/60">{label}</p>
      {hint && <p className="mt-2 text-xs text-white/40">{hint}</p>}
    </div>
  );
}

function RankTable({ title, rows, empty }: { title: string; rows: { label: string; value: number }[]; empty: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-5">
      <h3 className="mb-4 text-sm text-white/70">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-white/40">{empty}</p>
      ) : (
        <table className="w-full text-sm">
          <tbody>
            {rows.map((r) => (
              <tr key={r.label}>
                <td className="py-1.5 pr-3">
                  <span className="block truncate text-white/80" title={r.label}>{r.label}</span>
                  {/* Barra inline sin pista de fondo */}
                  <span className="mt-1 block h-1 rounded-full bg-[var(--rose)]" style={{ width: `${(r.value / max) * 100}%` }} />
                </td>
                <td className="w-16 py-1.5 text-right tabular-nums text-white/70">{nf.format(r.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default async function EstadisticasPage({ searchParams }: { searchParams: Promise<{ dias?: string }> }) {
  const { dias } = await searchParams;
  const days = RANGES.includes(Number(dias) as (typeof RANGES)[number]) ? Number(dias) : 30;

  let stats: Awaited<ReturnType<typeof loadStats>> | null = null;
  let error: string | null = null;
  try {
    stats = await loadStats(days);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Error al cargar las estadísticas';
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-white/50">Analítica propia, sin cookies. No cuenta bots ni el panel de admin.</p>
        <div className="flex gap-1 rounded-full bg-white/5 p-1" role="group" aria-label="Rango de fechas">
          {RANGES.map((r) => (
            <Link
              key={r}
              href={`/admin/estadisticas?dias=${r}`}
              aria-current={r === days ? 'true' : undefined}
              className={`rounded-full px-3 py-1.5 text-xs ${r === days ? 'bg-white text-[var(--dark)]' : 'text-white/60 hover:text-white'}`}
            >
              {r} días
            </Link>
          ))}
        </div>
      </div>

      {error || !stats ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-4">
          <p className="mb-1 text-sm text-amber-300">No se pudieron cargar las estadísticas</p>
          <p className="font-mono text-xs text-white/40">{error}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <Tile label="Visitas" value={nf.format(stats.pageviews)} />
            <Tile label="Solicitudes de valoración" value={nf.format(stats.valuations)} hint={`${nf.format(stats.otherLeads)} contactos más`} />
            <Tile label="Conversión del valorador" value={pct(stats.valuations, stats.sellViews)} hint="Solicitudes / visitas a páginas de venta" />
            <Tile label="Captaciones" value={nf.format(stats.captadas)} hint="Solicitudes del periodo marcadas como captadas" />
            <Tile label="Clics para contactar" value={nf.format(stats.phoneClicks + stats.whatsappClicks)} hint={`${stats.phoneClicks} teléfono · ${stats.whatsappClicks} WhatsApp`} />
          </div>

          <VisitsChart series={stats.series} />

          <Funnel steps={stats.funnel} />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <RankTable title="Páginas más vistas" rows={stats.topPages} empty="Aún no hay visitas registradas." />
            <RankTable title="De dónde llegan" rows={stats.sources} empty="Todas las visitas son directas o sin origen conocido." />
            <RankTable title="Valoraciones por municipio" rows={stats.cities} empty="Aún no hay solicitudes de valoración." />
            <RankTable
              title="Dispositivo"
              rows={Object.entries(stats.devices).map(([k, v]) => ({ label: k === 'mobile' ? 'Móvil' : k === 'desktop' ? 'Ordenador' : k, value: v }))}
              empty="Sin datos."
            />
          </div>
        </>
      )}
    </div>
  );
}

/** Barras diarias de visitas (una sola serie: sin leyenda, el título la nombra). Tooltip al pasar el ratón. */
function VisitsChart({ series }: { series: { key: string; visits: number; leads: number }[] }) {
  const max = Math.max(1, ...series.map((d) => d.visits));
  const label = (key: string) => new Date(`${key}T12:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  const ticks = [0, Math.floor((series.length - 1) / 2), series.length - 1];

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="text-sm text-white/70">Visitas por día</h3>
        <span className="text-xs text-white/40">máx. {nf.format(max)}</span>
      </div>
      <div className="relative h-44 border-b border-white/15">
        <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-white/[0.06]" aria-hidden />
        <ol className="absolute inset-0 flex items-end gap-[2px]">
          {series.map((d) => (
            <li key={d.key} className="group relative flex h-full flex-1 items-end">
              <span
                className="block w-full rounded-t-[4px] bg-[var(--rose)] transition-opacity group-hover:opacity-80"
                style={{ height: `${(d.visits / max) * 100}%`, minHeight: d.visits > 0 ? 2 : 0 }}
              />
              {/* Zona de hover a toda la altura, mayor que la barra */}
              <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-white px-3 py-2 text-xs text-[var(--dark)] shadow-lg group-hover:block">
                <strong className="block font-medium">{label(d.key)}</strong>
                {nf.format(d.visits)} visitas · {d.leads} solicitudes
              </span>
            </li>
          ))}
        </ol>
      </div>
      <div className="relative mt-2 h-4 whitespace-nowrap text-[11px] text-white/40">
        {ticks.map((i, n) => (
          <span
            key={i}
            className="absolute"
            style={{ left: `${(i / Math.max(1, series.length - 1)) * 100}%`, transform: n === 0 ? 'none' : n === 2 ? 'translateX(-100%)' : 'translateX(-50%)' }}
          >
            {label(series[i].key)}
          </span>
        ))}
      </div>
      <details className="mt-4 text-xs text-white/50">
        <summary className="cursor-pointer">Ver datos en tabla</summary>
        <table className="mt-2 w-full">
          <thead>
            <tr className="text-white/40"><th className="py-1 text-left font-normal">Día</th><th className="py-1 text-right font-normal">Visitas</th><th className="py-1 text-right font-normal">Solicitudes</th></tr>
          </thead>
          <tbody>
            {series.map((d) => (
              <tr key={d.key}><td className="py-0.5">{label(d.key)}</td><td className="py-0.5 text-right tabular-nums">{d.visits}</td><td className="py-0.5 text-right tabular-nums">{d.leads}</td></tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  );
}

/** Embudo del valorador: barras horizontales con % respecto al primer paso */
function Funnel({ steps }: { steps: { label: string; value: number }[] }) {
  const first = steps[0]?.value ?? 0;
  const max = Math.max(1, ...steps.map((s) => s.value));
  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-5">
      <h3 className="mb-4 text-sm text-white/70">Embudo del valorador</h3>
      <ol className="space-y-3">
        {steps.map((s, i) => (
          <li key={s.label} className="grid grid-cols-[minmax(0,200px)_1fr_auto] items-center gap-4 text-sm" title={`${s.label}: ${nf.format(s.value)}`}>
            <span className="truncate text-white/70">{s.label}</span>
            <span className="h-3">
              <span className="block h-full rounded-r-[4px] bg-[var(--rose)]" style={{ width: `${(s.value / max) * 100}%`, minWidth: s.value > 0 ? 3 : 0 }} />
            </span>
            <span className="w-28 text-right tabular-nums text-white/80">
              {nf.format(s.value)}
              {i > 0 && <span className="ml-2 text-xs text-white/40">{pct(s.value, first)}</span>}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
