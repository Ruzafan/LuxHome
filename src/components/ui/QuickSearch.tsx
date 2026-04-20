'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import LocationAutocomplete from './LocationAutocomplete';

interface Props {
  locations: string[];
}

export default function QuickSearch({ locations }: Props) {
  const t = useTranslations('home.search');
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    const operacion = data.get('operacion') as string;
    const tipo = data.get('tipo') as string;
    const ciudad = data.get('ciudad') as string;
    if (operacion) params.set('operacion', operacion);
    if (tipo) params.set('tipo', tipo);
    if (ciudad) params.set('ciudad', ciudad);
    const qs = params.toString();
    router.push(qs ? `/propiedades?${qs}` : '/propiedades');
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/10 backdrop-blur-md rounded-2xl p-2 flex flex-col md:flex-row gap-2 max-w-3xl mx-auto border border-white/20"
    >
      <select
        name="operacion"
        className="flex-1 bg-white rounded-xl pl-4 pr-10 py-3 text-[var(--navy)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
        defaultValue=""
      >
        <option value="">{t('operation')}</option>
        <option value="venta">{t('buy')}</option>
        <option value="alquiler">{t('rent')}</option>
      </select>

      <select
        name="tipo"
        className="flex-1 bg-white rounded-xl pl-4 pr-10 py-3 text-[var(--navy)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
        defaultValue=""
      >
        <option value="">{t('type')}</option>
        <option value="piso">{t('apartment')}</option>
        <option value="chalet">{t('villa')}</option>
        <option value="atico">{t('penthouse')}</option>
        <option value="casa">{t('house')}</option>
      </select>

      <LocationAutocomplete
        suggestions={locations}
        placeholder={t('location')}
        name="ciudad"
        inputClassName="w-full bg-white rounded-xl px-4 py-3 text-[var(--navy)] text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
      />

      <button
        type="submit"
        className="gold-gradient text-[var(--navy)] font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap"
      >
        {t('button')}
      </button>
    </form>
  );
}
