'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function HeroSearchBar({ locations }: { locations: string[] }) {
  const [operacion, setOperacion] = useState('venta');
  const [tipo, setTipo] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [habitaciones, setHabitaciones] = useState('');
  const router = useRouter();
  const t = useTranslations('home.search');

  void locations;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (operacion) params.set('operacion', operacion);
    if (tipo) params.set('tipo', tipo);
    if (ciudad) params.set('ciudad', ciudad);
    if (precioMax) params.set('precioMax', precioMax);
    if (habitaciones) params.set('habitaciones', habitaciones);
    router.push(`/propiedades?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-white flex flex-col rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm"
      style={{ boxShadow: '0 20px 60px oklch(0% 0% 0% / 0.25)' }}
    >
      {/* Operation tabs */}
      <div className="flex" style={{ borderBottom: '1px solid var(--bg2)' }}>
        {(['venta', 'alquiler'] as const).map((op) => (
          <button
            key={op}
            type="button"
            onClick={() => setOperacion(op)}
            className="flex-1 md:flex-none px-6 h-12 md:h-14 text-xs font-semibold tracking-[0.12em] uppercase transition-colors cursor-pointer border-none"
            style={{
              color: operacion === op ? 'var(--dark)' : 'var(--subtle)',
              background: operacion === op ? 'var(--bg2)' : 'white',
              borderRight: '1px solid var(--bg2)',
            }}
          >
            {op === 'venta' ? t('buy') : t('rent')}
          </button>
        ))}
        <div className="flex-1 md:hidden" style={{ borderLeft: '1px solid var(--bg2)', background: 'white' }} />
      </div>

      {/* Inputs + button row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 items-center">
        {/* Type select */}
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="w-full h-12 md:h-14 px-4 text-[13px] font-light bg-white outline-none cursor-pointer border-b sm:border-b-0 border-gray-100 sm:border-r"
          style={{ color: 'var(--mid)', borderColor: 'var(--bg2)' }}
        >
          <option value="">{t('type')}</option>
          <option value="piso">{t('apartment')}</option>
          <option value="chalet">{t('villa')}</option>
          <option value="atico">{t('penthouse')}</option>
          <option value="casa">{t('house')}</option>
        </select>

        {/* Location input */}
        <input
          type="text"
          value={ciudad}
          onChange={(e) => setCiudad(e.target.value)}
          placeholder={t('location')}
          className="w-full h-12 md:h-14 px-4 text-[13px] font-light bg-white outline-none border-b sm:border-b-0 border-gray-100 sm:border-r"
          style={{ color: 'var(--dark)', borderColor: 'var(--bg2)' }}
        />

        {/* Precio Máx */}
        <select
          value={precioMax}
          onChange={(e) => setPrecioMax(e.target.value)}
          className="w-full h-12 md:h-14 px-4 text-[13px] font-light bg-white outline-none cursor-pointer border-b lg:border-b-0 border-gray-100 lg:border-r"
          style={{ color: 'var(--mid)', borderColor: 'var(--bg2)' }}
        >
          <option value="">Precio Máx.</option>
          <option value="150000">150.000 €</option>
          <option value="250000">250.000 €</option>
          <option value="350000">350.000 €</option>
          <option value="500000">500.000 €</option>
          <option value="750000">750.000 €</option>
          <option value="1000000">1.000.000 €</option>
        </select>

        {/* Habitaciones */}
        <select
          value={habitaciones}
          onChange={(e) => setHabitaciones(e.target.value)}
          className="w-full h-12 md:h-14 px-4 text-[13px] font-light bg-white outline-none cursor-pointer border-b lg:border-b-0 border-gray-100 lg:border-r"
          style={{ color: 'var(--mid)', borderColor: 'var(--bg2)' }}
        >
          <option value="">Habitaciones</option>
          <option value="1">1+ hab.</option>
          <option value="2">2+ hab.</option>
          <option value="3">3+ hab.</option>
          <option value="4">4+ hab.</option>
        </select>

        {/* Search button */}
        <button
          type="submit"
          className="w-full h-12 md:h-14 px-6 text-white text-xs font-semibold tracking-[0.12em] uppercase transition-colors cursor-pointer border-none flex items-center justify-center gap-2"
          style={{ background: 'var(--dark)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--dark)')}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          {t('button')}
        </button>
      </div>
    </form>
  );
}
