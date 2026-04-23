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

  const page = rawParams.pagina ? Number(rawParams.pagina) : 1;
  const sort = (['price_asc', 'price_desc', 'newest'].includes(rawParams.orden ?? '')
    ? rawParams.orden
    : 'relevance') as 'relevance' | 'price_asc' | 'price_desc' | 'newest';

  const [{ properties, total, totalPages }, locations] = await Promise.all([
    getProperties(filters, page, 9, sort),
    getAllLocations(),
  ]);

  const baseUrl = getPathname({ href: '/propiedades', locale });

  return (
    <div className="pt-20 min-h-screen bg-[var(--cream)]">
      {/* Page header */}
      <div className="luxury-gradient py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-[var(--gold)] text-sm font-semibold tracking-[0.3em] uppercase mb-2">
            {t('badge')}
          </p>
          <h1 className="text-white font-bold text-4xl mb-2 font-playfair">
            {t('title')}
          </h1>
          <p className="text-white/60 text-sm">
            {t('results', { count: total })}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col lg:flex-row gap-8">
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

          {/* Active filter chips — visible on all screen sizes */}
          <ActiveFilters params={rawParams} baseUrl={baseUrl} t={t} />

          {properties.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.125 1.125 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
              <h2 className="text-xl font-semibold text-[var(--navy)] mb-2">{t('noResults')}</h2>
              <p className="text-gray-500 mb-6">{t('noResultsHint')}</p>
              <Link href="/propiedades" className="text-[var(--gold)] font-medium hover:underline">
                {t('results', { count: 0 }).replace('0 ', '')}
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-1 mt-10 flex-wrap">
                  {/* Flecha anterior */}
                  {page > 1 ? (
                    <PaginationLink page={page - 1} currentPage={page} params={rawParams} baseUrl={baseUrl} label="‹" />
                  ) : (
                    <span className="w-10 h-10 flex items-center justify-center text-gray-300 text-lg select-none">‹</span>
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
                    <PaginationLink page={page + 1} currentPage={page} params={rawParams} baseUrl={baseUrl} label="›" />
                  ) : (
                    <span className="w-10 h-10 flex items-center justify-center text-gray-300 text-lg select-none">›</span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
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
    <form action={baseUrl} method="get" className="bg-white rounded-xl shadow-md p-6 sticky top-24">
      <h2 className="font-bold text-[var(--navy)] text-lg mb-5 pb-3 border-b border-gray-100">
        {t('filters.title')}
      </h2>

      {/* Operación */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          {t('filters.operation')}
        </label>
        <div className="flex gap-2">
          {[
            { value: '', label: t('filters.allOperations') },
            { value: 'venta', label: t('filters.buy') },
            { value: 'alquiler', label: t('filters.rent') },
          ].map(({ value, label }) => (
            <label key={value} className="flex-1">
              <input
                type="radio"
                name="operacion"
                value={value}
                defaultChecked={currentParams.operacion === value || (!currentParams.operacion && value === '')}
                className="peer sr-only"
              />
              <span className="block text-center text-xs py-2 px-2 rounded-lg border border-gray-200 cursor-pointer peer-checked:bg-[var(--navy)] peer-checked:text-white peer-checked:border-[var(--navy)] hover:border-[var(--gold)] transition-colors">
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Tipo */}
      <div className="mb-5">
        <label htmlFor="tipo" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          {t('filters.type')}
        </label>
        <select
          id="tipo"
          name="tipo"
          defaultValue={currentParams.tipo ?? ''}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
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
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          {t('filters.location')}
        </label>
        <LocationAutocomplete
          suggestions={locations}
          defaultValue={currentParams.ciudad ?? ''}
          placeholder="Ej: Castelldefels..."
          name="ciudad"
          inputClassName="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
        />
      </div>

      {/* Precio */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Precio (€)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            name="precioMin"
            defaultValue={currentParams.precioMin ?? ''}
            placeholder="Mínimo"
            className="w-1/2 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
          />
          <input
            type="number"
            name="precioMax"
            defaultValue={currentParams.precioMax ?? ''}
            placeholder="Máximo"
            className="w-1/2 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
          />
        </div>
      </div>

      {/* Habitaciones */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          {t('filters.bedrooms')}
        </label>
        <div className="flex gap-2">
          {['', '1', '2', '3', '4', '5+'].map((v) => (
            <label key={v} className="flex-1">
              <input
                type="radio"
                name="habitaciones"
                value={v === '5+' ? '5' : v}
                defaultChecked={currentParams.habitaciones === (v === '5+' ? '5' : v) || (!currentParams.habitaciones && v === '')}
                className="peer sr-only"
              />
              <span className="block text-center text-xs py-2 rounded-lg border border-gray-200 cursor-pointer peer-checked:bg-[var(--navy)] peer-checked:text-white peer-checked:border-[var(--navy)] hover:border-[var(--gold)] transition-colors">
                {v || t('filters.anyBedrooms')}
              </span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3 gold-gradient text-[var(--navy)] font-semibold rounded-lg hover:opacity-90 transition-opacity"
      >
        {t('filters.search')}
      </button>

      <Link
        href="/propiedades"
        className="block text-center mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
      >
        {t('filters.clear')}
      </Link>
    </form>
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
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--navy)] text-white text-xs rounded-full hover:bg-[var(--gold)] hover:text-[var(--navy)] transition-colors"
          >
            {label}
            <span>×</span>
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
}: {
  page: number;
  currentPage: number;
  params: SearchParams;
  baseUrl: string;
  label?: string;
}) {
  const qs = Object.entries({ ...params, pagina: String(page) })
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join('&');

  const isActive = page === currentPage;

  return (
    <Link
      href={`/propiedades?${qs}`}
      className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-[var(--navy)] text-white'
          : 'bg-white text-[var(--navy)] border border-gray-200 hover:border-[var(--gold)]'
      }`}
    >
      {label ?? page}
    </Link>
  );
}
