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
        className="lg:hidden flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 py-2.5 text-sm text-[var(--dark)] transition-colors hover:border-[var(--accent)]"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
        </svg>
        {t('filters.title')}
        {activeFiltersCount > 0 && (
          <span className="w-5 h-5 rounded-full bg-[var(--rose)] text-[var(--dark)] text-xs font-medium flex items-center justify-center">
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
      <div className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[var(--radius-panel)] shadow-2xl transition-transform duration-300 lg:hidden ${open ? 'translate-y-0' : 'translate-y-full'}`}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h2 className="font-display text-[26px] font-light text-[var(--dark)]">{t('filters.title')}</h2>
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
              <label className="mb-2 block text-[13px] font-normal text-[var(--mid)]">{t('filters.operation')}</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: '', label: t('filters.allOperations') },
                  { value: 'venta', label: t('filters.buy') },
                  { value: 'alquiler', label: t('filters.rent') },
                ].map(({ value, label }) => (
                  <label key={value} className="flex-auto">
                    <input type="radio" name="operacion" value={value}
                      defaultChecked={currentParams.operacion === value || (!currentParams.operacion && value === '')}
                      className="peer sr-only" />
                    <span className="block whitespace-nowrap text-center text-xs py-2 px-3 rounded-full border border-[var(--line)] cursor-pointer peer-checked:bg-[var(--dark)] peer-checked:text-white peer-checked:border-[var(--dark)] hover:border-[var(--accent)] transition-colors">
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tipo */}
            <div>
              <label htmlFor="tipo-mobile" className="mb-2 block text-[13px] font-normal text-[var(--mid)]">{t('filters.type')}</label>
              <select id="tipo-mobile" name="tipo" defaultValue={currentParams.tipo ?? ''}
                className="w-full rounded-[var(--radius-input)] border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--rose)]">
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
              <label className="mb-2 block text-[13px] font-normal text-[var(--mid)]">{t('filters.location')}</label>
              <LocationAutocomplete
                suggestions={locations}
                defaultValue={currentParams.ciudad ?? ''}
                placeholder="Ej: Castelldefels..."
                name="ciudad"
                inputClassName="w-full rounded-[var(--radius-input)] border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--rose)]"
              />
            </div>

            {/* Precio */}
            <div>
              <label className="mb-2 block text-[13px] font-normal text-[var(--mid)]">Precio (€)</label>
              <div className="flex gap-2">
                <input type="number" name="precioMin" defaultValue={currentParams.precioMin ?? ''} placeholder="Mínimo"
                  className="w-1/2 rounded-[var(--radius-input)] border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--rose)]" />
                <input type="number" name="precioMax" defaultValue={currentParams.precioMax ?? ''} placeholder="Máximo"
                  className="w-1/2 rounded-[var(--radius-input)] border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--rose)]" />
              </div>
            </div>

            {/* Habitaciones */}
            <div>
              <label className="mb-2 block text-[13px] font-normal text-[var(--mid)]">{t('filters.bedrooms')}</label>
              <div className="flex gap-2">
                {['', '1', '2', '3', '4', '5+'].map((v) => (
                  <label key={v} className={v === '' ? 'flex-[1.8]' : 'flex-1'}>
                    <input type="radio" name="habitaciones" value={v === '5+' ? '5' : v}
                      defaultChecked={currentParams.habitaciones === (v === '5+' ? '5' : v) || (!currentParams.habitaciones && v === '')}
                      className="peer sr-only" />
                    <span className="block text-center text-xs py-2.5 rounded-full border border-[var(--line)] cursor-pointer peer-checked:bg-[var(--dark)] peer-checked:text-white peer-checked:border-[var(--dark)] hover:border-[var(--accent)] transition-colors">
                      {v || t('filters.anyBedrooms')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <a href={baseUrl} className="btn flex-1 border border-[var(--line)] text-[var(--dark)]">
                {t('filters.clear')}
              </a>
              <button type="submit" className="btn btn-primary flex-1">
                {t('filters.search')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
