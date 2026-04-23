'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function HeroSearchBar({ locations }: { locations: string[] }) {
  const [operacion, setOperacion] = useState('venta');
  const [tipo, setTipo] = useState('');
  const [ciudad, setCiudad] = useState('');
  const router = useRouter();
  const t = useTranslations('home.search');

  void locations;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (operacion) params.set('operacion', operacion);
    if (tipo) params.set('tipo', tipo);
    if (ciudad) params.set('ciudad', ciudad);
    router.push(`/propiedades?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex bg-white"
      style={{ boxShadow: '0 20px 60px oklch(0% 0% 0% / 0.25)' }}
    >
      {/* Tabs */}
      <div className="flex" style={{ borderRight: '1px solid var(--bg2)' }}>
        {(['venta', 'alquiler'] as const).map((op) => (
          <button
            key={op}
            type="button"
            onClick={() => setOperacion(op)}
            className="px-5 h-14 text-xs font-medium tracking-[0.1em] uppercase transition-colors cursor-pointer border-none"
            style={{
              color: operacion === op ? 'var(--dark)' : 'var(--subtle)',
              background: operacion === op ? 'var(--bg2)' : 'white',
            }}
          >
            {op === 'venta' ? t('buy') : t('rent')}
          </button>
        ))}
      </div>

      {/* Type select */}
      <select
        value={tipo}
        onChange={(e) => setTipo(e.target.value)}
        className="h-14 px-5 text-[13px] font-light bg-white outline-none cursor-pointer min-w-[150px]"
        style={{ color: 'var(--mid)', borderRight: '1px solid var(--bg2)', border: 'none', borderRight: '1px solid var(--bg2)' }}
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
        className="flex-1 h-14 px-5 text-[13px] font-light bg-white outline-none min-w-[180px]"
        style={{ color: 'var(--dark)' }}
      />

      {/* Search button */}
      <button
        type="submit"
        className="h-14 px-7 text-white text-xs font-medium tracking-[0.12em] uppercase transition-colors cursor-pointer border-none"
        style={{ background: 'var(--dark)' }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--dark)')}
      >
        {t('button')}
      </button>
    </form>
  );
}
