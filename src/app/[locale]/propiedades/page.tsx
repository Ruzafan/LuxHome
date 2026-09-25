import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getPathname } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import { getProperties, getAllLocations } from '@/lib/propertyService';
import { PropertyFilters, PropertyType, OperationType } from '@/types/property';
import PropertyCard from '@/components/properties/PropertyCard';
import LocationAutocomplete from '@/components/ui/LocationAutocomplete';
import SortSelect from '@/components/properties/SortSelect';
import FilterDrawer from '@/components/properties/FilterDrawer';
import { getAlternates } from '@/lib/seo';
import PageHeader from '@/components/layout/PageHeader';
import { CaretLeft, CaretRight, HouseLine, X } from '@phosphor-icons/react/ssr';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'properties' });
  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: getAlternates('/propiedades'),
  };
}

interface SearchParams {
  operacion?: string;
  tipo?: string;
  ciudad?: string;
  precioMin?: string;
  precioMax?: string;
  habitaciones?: string;
  piscina?: string;
  terraza?: string;
  garaje?: string;
  destacado?: string;
  obraNueva?: string;
  orden?: string;
  pagina?: string;
}

export default async function PropiedadesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const [{ locale }, rawParams, t] = await Promise.all([
    params,
    searchParams,
    getTranslations('properties'),
  ]);

  const filters: PropertyFilters = {};
  if (rawParams.operacion === 'venta' || rawParams.operacion === 'alquiler') {
    filters.operation = rawParams.operacion as OperationType;
  }
  if (rawParams.tipo) filters.type = rawParams.tipo as PropertyType;
  if (rawParams.ciudad) filters.city = rawParams.ciudad;
  if (rawParams.precioMin) filters.minPrice = Number(rawParams.precioMin);
  if (rawParams.precioMax) filters.maxPrice = Number(rawParams.precioMax);
  if (rawParams.habitaciones) filters.minBedrooms = Number(rawParams.habitaciones);
  if (rawParams.piscina === '1' || rawParams.piscina === 'true') filters.hasPool = true;
  if (rawParams.terraza === '1' || rawParams.terraza === 'true') filters.hasTerrace = true;
  if (rawParams.garaje === '1' || rawParams.garaje === 'true') filters.hasGarage = true;
  if (rawParams.destacado === '1' || rawParams.destacado === 'true') filters.isFeatured = true;
  if (rawParams.obraNueva === '1' || rawParams.obraNueva === 'true') filters.isNewDevelopment = true;

  const page = rawParams.pagina ? Number(rawParams.pagina) : 1;
  const sort = (['price_asc', 'price_desc', 'newest'].includes(rawParams.orden ?? '')
    ? rawParams.orden
    : 'relevance') as 'relevance' | 'price_asc' | 'price_desc' | 'newest';

  const [{ properties, total, totalPages }, locations] = await Promise.all([
    getProperties(filters, page, 9, sort),
    getAllLocations(),
  ]);

  const baseUrl = getPathname({ href: '/propiedades', locale });
  const canonicalBase = `https://luxhomein.com/propiedades`;

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Propiedades en venta y alquiler | LuxHome',
    description: 'Listado de propiedades disponibles en el Vallès Occidental gestionadas por LuxHome Inmobiliaria.',
    url: canonicalBase,
    numberOfItems: total,
    itemListElement: properties.map((p, i) => ({
      '@type': 'ListItem',
      position: (page - 1) * 9 + i + 1,
      url: `https://luxhomein.com/propiedades/${p.id}`,
      name: p.title,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      {page > 1 && (
        <link rel="prev" href={page === 2 ? canonicalBase : `${canonicalBase}?pagina=${page - 1}`} />
      )}
      {page < totalPages && (
        <link rel="next" href={`${canonicalBase}?pagina=${page + 1}`} />
      )}
    <div className="min-h-screen bg-[var(--cream)]">
      <PageHeader eyebrow={t('badge')} title={t('title')} subtitle={t('results', { count: total })} />

      <div className="container-lux flex flex-col gap-8 py-10 lg:flex-row">
        {/* ─── Sidebar Filters (desktop) ───────────────────────────────────────── */}
        <aside className="hidden lg:block lg:w-72 shrink-0">
          <FilterPanel currentParams={rawParams} locations={locations} baseUrl={baseUrl} t={t} />
        </aside>

        {/* ─── Results ─────────────────────────────────────────────────────────── */}
        <div className="flex-1">
          {/* Mobile filter trigger */}
          <div className="flex items-center justify-between mb-4 gap-3 lg:hidden">
            <FilterDrawer
              currentParams={rawParams}
              locations={locations}
              baseUrl={baseUrl}
              activeFiltersCount={[rawParams.operacion, rawParams.tipo, rawParams.ciudad, rawParams.habitaciones, rawParams.precioMin, rawParams.precioMax].filter(Boolean).length}
            />
            <SortSelect
              currentSort={sort}
              label={t('sort')}
              options={[
                { value: 'relevance', label: t('sortRelevance') },
                { value: 'price_asc', label: t('sortPriceAsc') },
                { value: 'price_desc', label: t('sortPriceDesc') },
                { value: 'newest', label: t('sortNewest') },
              ]}
            />
          </div>

          {/* Sort (desktop only — mobile sort is in the drawer row above) */}
          <div className="hidden lg:flex items-center justify-end mb-4">
            <SortSelect
              currentSort={sort}
              label={t('sort')}
              options={[
                { value: 'relevance', label: t('sortRelevance') },
                { value: 'price_asc', label: t('sortPriceAsc') },
                { value: 'price_desc', label: t('sortPriceDesc') },
                { value: 'newest', label: t('sortNewest') },
              ]}
            />
          </div>

          {/* Quick filter pill chips */}
          <QuickFilterChips params={rawParams} />

          {/* Active filter chips — visible on all screen sizes */}
          <ActiveFilters params={rawParams} baseUrl={baseUrl} t={t} />

          {properties.length === 0 ? (
            <div className="flex flex-col items-center rounded-[var(--radius-panel)] bg-white px-6 py-20 text-center" style={{ boxShadow: 'inset 0 0 0 1px var(--line)' }}>
              <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--rose-soft)] text-[var(--accent)]">
                <HouseLine size={30} weight="light" />
              </span>
              <h2 className="font-display mb-2 text-[30px] font-light">{t('noResults')}</h2>
              <p className="mb-7 max-w-[42ch] text-[15px] text-[var(--mid)]">{t('noResultsHint')}</p>
              <Link href="/propiedades" className="btn btn-primary">
                {t('filters.clear')}
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-1 mt-10 flex-wrap">
                  {/* Flecha anterior */}
                  {page > 1 ? (
                    <PaginationLink page={page - 1} currentPage={page} params={rawParams} baseUrl={baseUrl} label={<CaretLeft size={16} />} ariaLabel="Página anterior" />
                  ) : (
                    <span className="flex h-10 w-10 select-none items-center justify-center text-[var(--subtle)] opacity-50"><CaretLeft size={16} /></span>
                  )}

                  {buildPageList(page, totalPages).map((p, i) =>
                    p === '...' ? (
                      <span key={`ellipsis-${i}`} className="w-10 h-10 flex items-center justify-center text-gray-400 text-sm select-none">…</span>
                    ) : (
                      <PaginationLink key={p} page={p} currentPage={page} params={rawParams} baseUrl={baseUrl} />
                    )
                  )}

                  {/* Flecha siguiente */}
                  {page < totalPages ? (
                    <PaginationLink page={page + 1} currentPage={page} params={rawParams} baseUrl={baseUrl} label={<CaretRight size={16} />} ariaLabel="Página siguiente" />
                  ) : (
                    <span className="flex h-10 w-10 select-none items-center justify-center text-[var(--subtle)] opacity-50"><CaretRight size={16} /></span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

// ─── Filter Panel ──────────────────────────────────────────────────────────────

type TFn = Awaited<ReturnType<typeof getTranslations<'properties'>>>;

function FilterPanel({
  currentParams,
  locations,
  baseUrl,
  t,
}: {
  currentParams: SearchParams;
  locations: string[];
  baseUrl: string;
  t: TFn;
}) {
  return (
    <form action={baseUrl} method="get" className="sticky top-24 rounded-[var(--radius-card)] bg-white p-6" style={{ boxShadow: 'inset 0 0 0 1px var(--line)' }}>
      <h2 className="font-display mb-5 text-[26px] font-light text-[var(--dark)]">
        {t('filters.title')}
      </h2>

      {/* Operación */}
      <div className="mb-5">
        <label className="mb-2 block text-[13px] font-normal text-[var(--mid)]">
          {t('filters.operation')}
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { value: '', label: t('filters.allOperations') },
            { value: 'venta', label: t('filters.buy') },
            { value: 'alquiler', label: t('filters.rent') },
          ].map(({ value, label }) => (
            <label key={value} className="flex-auto">
              <input
                type="radio"
                name="operacion"
                value={value}
                defaultChecked={currentParams.operacion === value || (!currentParams.operacion && value === '')}
                className="peer sr-only"
              />
              <span className="block whitespace-nowrap text-center text-xs py-2 px-3 rounded-full border border-[var(--line)] cursor-pointer peer-checked:bg-[var(--dark)] peer-checked:text-white peer-checked:border-[var(--dark)] hover:border-[var(--accent)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--rose)] transition-colors">
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Tipo */}
      <div className="mb-5">
        <label htmlFor="tipo" className="mb-2 block text-[13px] font-normal text-[var(--mid)]">
          {t('filters.type')}
        </label>
        <select
          id="tipo"
          name="tipo"
          defaultValue={currentParams.tipo ?? ''}
          className="w-full rounded-[var(--radius-input)] border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--rose)]"
        >
          <option value="">{t('filters.allTypes')}</option>
          <option value="piso">{t('filters.apartment')}</option>
          <option value="chalet">{t('filters.villa')}</option>
          <option value="atico">{t('filters.penthouse')}</option>
          <option value="casa">{t('filters.house')}</option>
          <option value="local">Local</option>
          <option value="terreno">Terreno</option>
        </select>
      </div>

      {/* Ciudad */}
      <div className="mb-5">
        <label className="mb-2 block text-[13px] font-normal text-[var(--mid)]">
          {t('filters.location')}
        </label>
        <LocationAutocomplete
          suggestions={locations}
          defaultValue={currentParams.ciudad ?? ''}
          placeholder="Ej: Castelldefels..."
          name="ciudad"
          inputClassName="w-full rounded-[var(--radius-input)] border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--rose)]"
        />
      </div>

      {/* Precio */}
      <div className="mb-5">
        <label className="mb-2 block text-[13px] font-normal text-[var(--mid)]">
          Precio (€)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            name="precioMin"
            defaultValue={currentParams.precioMin ?? ''}
            placeholder="Mínimo"
            className="w-1/2 rounded-[var(--radius-input)] border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--rose)]"
          />
          <input
            type="number"
            name="precioMax"
            defaultValue={currentParams.precioMax ?? ''}
            placeholder="Máximo"
            className="w-1/2 rounded-[var(--radius-input)] border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--rose)]"
          />
        </div>
      </div>

      {/* Habitaciones */}
      <div className="mb-6">
        <label className="mb-2 block text-[13px] font-normal text-[var(--mid)]">
          {t('filters.bedrooms')}
        </label>
        <div className="flex gap-2">
          {['', '1', '2', '3', '4', '5+'].map((v) => (
            <label key={v} className={v === '' ? 'flex-[1.8]' : 'flex-1'}>
              <input
                type="radio"
                name="habitaciones"
                value={v === '5+' ? '5' : v}
                defaultChecked={currentParams.habitaciones === (v === '5+' ? '5' : v) || (!currentParams.habitaciones && v === '')}
                className="peer sr-only"
              />
              <span className="block text-center text-xs py-2.5 rounded-full border border-[var(--line)] cursor-pointer peer-checked:bg-[var(--dark)] peer-checked:text-white peer-checked:border-[var(--dark)] hover:border-[var(--accent)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--rose)] transition-colors">
                {v || t('filters.anyBedrooms')}
              </span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="btn btn-primary w-full"
      >
        {t('filters.search')}
      </button>

      <Link
        href="/propiedades"
        className="mt-3 block text-center text-sm text-[var(--mid)] transition-colors hover:text-[var(--dark)]"
      >
        {t('filters.clear')}
      </Link>
    </form>
  );
}

// ─── Quick Filter Chips ───────────────────────────────────────────────────────

function QuickFilterChips({ params }: { params: SearchParams }) {
  const tags = [
    { key: 'piscina', label: 'Con piscina', param: 'piscina' },
    { key: 'terraza', label: 'Con terraza', param: 'terraza' },
    { key: 'garaje', label: 'Con garaje', param: 'garaje' },
    { key: 'destacado', label: 'Destacados', param: 'destacado' },
    { key: 'obraNueva', label: 'Obra nueva', param: 'obraNueva' },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 no-scrollbar">
      {tags.map((tag) => {
        const isActive = params[tag.param as keyof SearchParams] === '1';
        const newParams = { ...params };
        if (isActive) {
          delete newParams[tag.param as keyof SearchParams];
        } else {
          newParams[tag.param as keyof SearchParams] = '1';
        }
        delete newParams.pagina;

        const qs = Object.entries(newParams)
          .filter(([, v]) => v !== undefined && v !== '')
          .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
          .join('&');

        return (
          <Link
            key={tag.key}
            href={`/propiedades${qs ? `?${qs}` : ''}`}
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-[13px] transition-colors ${
              isActive
                ? 'border-[var(--dark)] bg-[var(--dark)] text-white'
                : 'border-[var(--line)] bg-white text-[var(--dark)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
            }`}
          >
            {tag.label}
          </Link>
        );
      })}
    </div>
  );
}

// ─── Active Filters ────────────────────────────────────────────────────────────

function ActiveFilters({ params, baseUrl, t }: { params: SearchParams; baseUrl: string; t: TFn }) {
  const chips = [
    params.operacion && { key: 'operacion', label: params.operacion === 'venta' ? t('filters.buy') : t('filters.rent') },
    params.tipo && { key: 'tipo', label: params.tipo },
    params.ciudad && { key: 'ciudad', label: params.ciudad },
    params.habitaciones && { key: 'habitaciones', label: `${params.habitaciones}+ hab.` },
  ].filter(Boolean) as { key: string; label: string }[];

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {chips.map(({ key, label }) => {
        const rest = { ...params, [key]: undefined, pagina: undefined };
        const qs = Object.entries(rest)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
          .join('&');
        return (
          <Link
            key={key}
            href={`/propiedades${qs ? `?${qs}` : ''}`}
            className="flex items-center gap-1.5 rounded-full bg-[var(--rose-soft)] px-3.5 py-1.5 text-[13px] text-[var(--dark)] transition-colors hover:bg-[var(--rose)]"
          >
            {label}
            <X size={12} aria-label="Quitar filtro" />
          </Link>
        );
      })}
    </div>
  );
}

// ─── Pagination helpers ────────────────────────────────────────────────────────

function buildPageList(current: number, total: number): (number | '...')[] {
  const delta = 3; // páginas a cada lado del actual
  const pages: (number | '...')[] = [];

  if (total <= 2 * delta + 3) {
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  }

  const rangeStart = Math.max(2, current - delta);
  const rangeEnd   = Math.min(total - 1, current + delta);

  pages.push(1);
  if (rangeStart > 2) pages.push('...');
  for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);
  if (rangeEnd < total - 1) pages.push('...');
  pages.push(total);

  return pages;
}

// ─── Pagination Link ───────────────────────────────────────────────────────────

function PaginationLink({
  page,
  currentPage,
  params,
  baseUrl,
  label,
  ariaLabel,
}: {
  page: number;
  currentPage: number;
  params: SearchParams;
  baseUrl: string;
  label?: React.ReactNode;
  ariaLabel?: string;
}) {
  const qs = Object.entries({ ...params, pagina: String(page) })
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join('&');

  const isActive = page === currentPage;

  return (
    <Link
      href={`/propiedades?${qs}`}
      aria-label={ariaLabel}
      aria-current={isActive ? 'page' : undefined}
      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm transition-colors ${
        isActive
          ? 'bg-[var(--dark)] text-white'
          : 'bg-white text-[var(--dark)] hover:bg-[var(--rose-soft)]'
      }`}
    >
      {label ?? page}
    </Link>
  );
}
