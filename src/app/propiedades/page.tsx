import { Metadata } from 'next';
import { getProperties, getAllLocations } from '@/lib/propertyService';
import { PropertyFilters, PropertyType, OperationType } from '@/types/property';
import PropertyCard from '@/components/properties/PropertyCard';
import LocationAutocomplete from '@/components/ui/LocationAutocomplete';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Propiedades',
  description: 'Explora nuestra selección de propiedades de lujo en Barcelona y la Costa Brava.',
};

interface SearchParams {
  operacion?: string;
  tipo?: string;
  ciudad?: string;
  precioMin?: string;
  precioMax?: string;
  habitaciones?: string;
  pagina?: string;
}

export default async function PropiedadesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const filters: PropertyFilters = {};
  if (params.operacion && (params.operacion === 'venta' || params.operacion === 'alquiler')) {
    filters.operation = params.operacion as OperationType;
  }
  if (params.tipo) filters.type = params.tipo as PropertyType;
  if (params.ciudad) filters.city = params.ciudad;
  if (params.precioMin) filters.minPrice = Number(params.precioMin);
  if (params.precioMax) filters.maxPrice = Number(params.precioMax);
  if (params.habitaciones) filters.minBedrooms = Number(params.habitaciones);

  const page = params.pagina ? Number(params.pagina) : 1;
  const [{ properties, total, totalPages }, locations] = await Promise.all([
    getProperties(filters, page, 9),
    getAllLocations(),
  ]);

  return (
    <div className="pt-20 min-h-screen bg-[#faf8f3]">
      {/* Page header */}
      <div className="luxury-gradient py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-[#c9a84c] text-sm font-semibold tracking-[0.3em] uppercase mb-2">Catálogo completo</p>
          <h1 className="text-white font-bold text-4xl mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
            Propiedades
          </h1>
          <p className="text-white/60 text-sm">
            {total} {total === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col lg:flex-row gap-8">
        {/* ─── Sidebar Filters ─────────────────────────────────────────────────── */}
        <aside className="lg:w-72 shrink-0">
          <FilterPanel currentParams={params} locations={locations} />
        </aside>

        {/* ─── Results ─────────────────────────────────────────────────────────── */}
        <div className="flex-1">
          {/* Active filters */}
          <ActiveFilters params={params} />

          {properties.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">🏠</p>
              <h2 className="text-xl font-semibold text-[#0f1f3d] mb-2">Sin resultados</h2>
              <p className="text-gray-500 mb-6">No hemos encontrado propiedades con esos filtros.</p>
              <Link href="/propiedades" className="text-[#c9a84c] font-medium hover:underline">
                Ver todas las propiedades
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <PaginationLink
                      key={p}
                      page={p}
                      currentPage={page}
                      params={params}
                    />
                  ))}
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

function FilterPanel({ currentParams, locations }: { currentParams: SearchParams; locations: string[] }) {
  const baseUrl = '/propiedades';

  return (
    <form action={baseUrl} method="get" className="bg-white rounded-xl shadow-md p-6 sticky top-24">
      <h2 className="font-bold text-[#0f1f3d] text-lg mb-5 pb-3 border-b border-gray-100">
        Filtros
      </h2>

      {/* Operación */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Operación
        </label>
        <div className="flex gap-2">
          {[
            { value: '', label: 'Todas' },
            { value: 'venta', label: 'Comprar' },
            { value: 'alquiler', label: 'Alquilar' },
          ].map(({ value, label }) => (
            <label key={value} className="flex-1">
              <input
                type="radio"
                name="operacion"
                value={value}
                defaultChecked={currentParams.operacion === value || (!currentParams.operacion && value === '')}
                className="peer sr-only"
              />
              <span className="block text-center text-xs py-2 px-2 rounded-lg border border-gray-200 cursor-pointer peer-checked:bg-[#0f1f3d] peer-checked:text-white peer-checked:border-[#0f1f3d] hover:border-[#c9a84c] transition-colors">
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Tipo */}
      <div className="mb-5">
        <label htmlFor="tipo" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Tipo de propiedad
        </label>
        <select
          id="tipo"
          name="tipo"
          defaultValue={currentParams.tipo ?? ''}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
        >
          <option value="">Todos los tipos</option>
          <option value="piso">Piso</option>
          <option value="chalet">Chalet</option>
          <option value="atico">Ático</option>
          <option value="casa">Casa</option>
          <option value="local">Local</option>
          <option value="terreno">Terreno</option>
        </select>
      </div>

      {/* Ciudad */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Ciudad o zona
        </label>
        <LocationAutocomplete
          suggestions={locations}
          defaultValue={currentParams.ciudad ?? ''}
          placeholder="Ej: Castelldefels..."
          name="ciudad"
          inputClassName="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
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
            className="w-1/2 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
          />
          <input
            type="number"
            name="precioMax"
            defaultValue={currentParams.precioMax ?? ''}
            placeholder="Máximo"
            className="w-1/2 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
          />
        </div>
      </div>

      {/* Habitaciones */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Habitaciones mínimas
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
              <span className="block text-center text-xs py-2 rounded-lg border border-gray-200 cursor-pointer peer-checked:bg-[#0f1f3d] peer-checked:text-white peer-checked:border-[#0f1f3d] hover:border-[#c9a84c] transition-colors">
                {v || 'Todos'}
              </span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3 gold-gradient text-[#0f1f3d] font-semibold rounded-lg hover:opacity-90 transition-opacity"
      >
        Aplicar filtros
      </button>

      <Link
        href="/propiedades"
        className="block text-center mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
      >
        Limpiar filtros
      </Link>
    </form>
  );
}

// ─── Active Filters ────────────────────────────────────────────────────────────

function ActiveFilters({ params }: { params: SearchParams }) {
  const chips = [
    params.operacion && { key: 'operacion', label: params.operacion === 'venta' ? 'Comprar' : 'Alquilar' },
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
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0f1f3d] text-white text-xs rounded-full hover:bg-[#c9a84c] hover:text-[#0f1f3d] transition-colors"
          >
            {label}
            <span>×</span>
          </Link>
        );
      })}
    </div>
  );
}

// ─── Pagination Link ───────────────────────────────────────────────────────────

function PaginationLink({
  page,
  currentPage,
  params,
}: {
  page: number;
  currentPage: number;
  params: SearchParams;
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
          ? 'bg-[#0f1f3d] text-white'
          : 'bg-white text-[#0f1f3d] border border-gray-200 hover:border-[#c9a84c]'
      }`}
    >
      {page}
    </Link>
  );
}
