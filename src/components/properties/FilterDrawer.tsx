'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import LocationAutocomplete from '@/components/ui/LocationAutocomplete';

interface SearchParams {
  operacion?: string;
  tipo?: string;
  ciudad?: string;
  precioMin?: string;
  precioMax?: string;
  habitaciones?: string;
  orden?: string;
}

interface Props {
  currentParams: SearchParams;
  locations: string[];
  baseUrl: string;
  activeFiltersCount: number;
}

export default function FilterDrawer({ currentParams, locations, baseUrl, activeFiltersCount }: Props) {
  const t = useTranslations('properties');
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger button — only visible on mobile */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-[#0f1f3d] shadow-sm hover:border-[#c9a84c] transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
        </svg>
        {t('filters.title')}
        {activeFiltersCount > 0 && (
          <span className="w-5 h-5 rounded-full bg-[#c9a84c] text-[#0f1f3d] text-xs font-bold flex items-center justify-center">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 lg:hidden ${open ? 'translate-y-0' : 'translate-y-full'}`}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h2 className="font-bold text-[#0f1f3d] text-lg">{t('filters.title')}</h2>
          <button onClick={() => setOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto max-h-[70vh] p-5">
          <form action={baseUrl} method="get" className="space-y-5" onSubmit={() => setOpen(false)}>

            {/* Operación */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('filters.operation')}</label>
              <div className="flex gap-2">
                {[
                  { value: '', label: t('filters.allOperations') },
                  { value: 'venta', label: t('filters.buy') },
                  { value: 'alquiler', label: t('filters.rent') },
                ].map(({ value, label }) => (
                  <label key={value} className="flex-1">
                    <input type="radio" name="operacion" value={value}
                      defaultChecked={currentParams.operacion === value || (!currentParams.operacion && value === '')}
                      className="peer sr-only" />
                    <span className="block text-center text-xs py-2 px-2 rounded-lg border border-gray-200 cursor-pointer peer-checked:bg-[#0f1f3d] peer-checked:text-white peer-checked:border-[#0f1f3d] hover:border-[#c9a84c] transition-colors">
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tipo */}
            <div>
              <label htmlFor="tipo-mobile" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('filters.type')}</label>
              <select id="tipo-mobile" name="tipo" defaultValue={currentParams.tipo ?? ''}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]">
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
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('filters.location')}</label>
              <LocationAutocomplete
                suggestions={locations}
                defaultValue={currentParams.ciudad ?? ''}
                placeholder="Ej: Castelldefels..."
                name="ciudad"
                inputClassName="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
              />
            </div>

            {/* Precio */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Precio (€)</label>
              <div className="flex gap-2">
                <input type="number" name="precioMin" defaultValue={currentParams.precioMin ?? ''} placeholder="Mínimo"
                  className="w-1/2 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]" />
                <input type="number" name="precioMax" defaultValue={currentParams.precioMax ?? ''} placeholder="Máximo"
                  className="w-1/2 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]" />
              </div>
            </div>

            {/* Habitaciones */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('filters.bedrooms')}</label>
              <div className="flex gap-2">
                {['', '1', '2', '3', '4', '5+'].map((v) => (
                  <label key={v} className="flex-1">
                    <input type="radio" name="habitaciones" value={v === '5+' ? '5' : v}
                      defaultChecked={currentParams.habitaciones === (v === '5+' ? '5' : v) || (!currentParams.habitaciones && v === '')}
                      className="peer sr-only" />
                    <span className="block text-center text-xs py-2 rounded-lg border border-gray-200 cursor-pointer peer-checked:bg-[#0f1f3d] peer-checked:text-white peer-checked:border-[#0f1f3d] hover:border-[#c9a84c] transition-colors">
                      {v || t('filters.anyBedrooms')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <a href={baseUrl} className="flex-1 py-3 text-center text-sm text-gray-400 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors">
                {t('filters.clear')}
              </a>
              <button type="submit" className="flex-1 py-3 gold-gradient text-[#0f1f3d] font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm">
                {t('filters.search')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
