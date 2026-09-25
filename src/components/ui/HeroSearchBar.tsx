'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { MagnifyingGlass } from '@phosphor-icons/react';

const fieldClass =
  'w-full appearance-none bg-transparent text-[15px] font-normal text-[var(--dark)] outline-none cursor-pointer';

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 rounded-[var(--radius-input)] px-4 py-2.5 transition-colors focus-within:bg-[var(--rose-soft)] hover:bg-[var(--bg2)] lg:rounded-full lg:px-6">
      <label htmlFor={htmlFor} className="text-[11px] font-medium" style={{ color: 'var(--mid)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default function HeroSearchBar({ locations }: { locations: string[] }) {
  const [operacion, setOperacion] = useState('venta');
  const [tipo, setTipo] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [habitaciones, setHabitaciones] = useState('');
  const router = useRouter();
  const t = useTranslations('home.search');

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
    <form onSubmit={handleSubmit} className="w-full">
      {/* Operation toggle */}
      <div
        role="radiogroup"
        aria-label={t('operation')}
        className="mb-3 inline-flex rounded-full p-1"
        style={{ background: 'oklch(100% 0 0 / 0.16)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      >
        {(['venta', 'alquiler'] as const).map((op) => {
          const active = operacion === op;
          return (
            <button
              key={op}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setOperacion(op)}
              className="cursor-pointer rounded-full px-5 py-2 text-[13px] font-medium transition-colors"
              style={{ background: active ? 'white' : 'transparent', color: active ? 'var(--dark)' : 'white' }}
            >
              {op === 'venta' ? t('buy') : t('rent')}
            </button>
          );
        })}
      </div>

      <div
        className="grid grid-cols-2 gap-1 rounded-[var(--radius-card)] bg-white p-2 lg:grid-cols-[1fr_1.2fr_1fr_1fr_auto] lg:items-center lg:rounded-full"
        style={{ boxShadow: '0 30px 80px -24px oklch(15% 0.03 340 / 0.55)' }}
      >
        <Field label={t('type')} htmlFor="hero-tipo">
          <select id="hero-tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} className={fieldClass}>
            <option value="">Cualquiera</option>
            <option value="piso">{t('apartment')}</option>
            <option value="chalet">{t('villa')}</option>
            <option value="atico">{t('penthouse')}</option>
            <option value="casa">{t('house')}</option>
          </select>
        </Field>

        <Field label={t('location')} htmlFor="hero-ciudad">
          <input
            id="hero-ciudad"
            type="text"
            list="hero-locations"
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
            placeholder="Santa Perpètua, Mollet..."
            className={`${fieldClass} cursor-text placeholder:text-[var(--subtle)]`}
          />
          <datalist id="hero-locations">
            {locations.map((loc) => (
              <option key={loc} value={loc} />
            ))}
          </datalist>
        </Field>

        <Field label="Precio máximo" htmlFor="hero-precio">
          <select id="hero-precio" value={precioMax} onChange={(e) => setPrecioMax(e.target.value)} className={fieldClass}>
            <option value="">Sin límite</option>
            <option value="150000">150.000 €</option>
            <option value="250000">250.000 €</option>
            <option value="350000">350.000 €</option>
            <option value="500000">500.000 €</option>
            <option value="750000">750.000 €</option>
            <option value="1000000">1.000.000 €</option>
          </select>
        </Field>

        <Field label="Habitaciones" htmlFor="hero-hab">
          <select id="hero-hab" value={habitaciones} onChange={(e) => setHabitaciones(e.target.value)} className={fieldClass}>
            <option value="">Cualquiera</option>
            <option value="1">1 o más</option>
            <option value="2">2 o más</option>
            <option value="3">3 o más</option>
            <option value="4">4 o más</option>
          </select>
        </Field>

        <button
          type="submit"
          className="btn btn-primary col-span-2 h-14 lg:col-span-1 lg:h-[60px] lg:px-7"
        >
          <MagnifyingGlass size={18} weight="bold" />
          {t('button')}
        </button>
      </div>
    </form>
  );
}
