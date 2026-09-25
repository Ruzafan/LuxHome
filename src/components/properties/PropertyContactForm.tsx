'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface Props {
  propertyRef: string;
  propertyTitle: string;
}

export default function PropertyContactForm({ propertyRef, propertyTitle }: Props) {
  const t = useTranslations('property');
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        asunto: `Consulta sobre propiedad ${propertyRef}`,
        apellidos: '',
        _propertyRef: propertyRef,
        _propertyTitle: propertyTitle,
      }),
    });

    if (res.ok) {
      setStatus('ok');
      form.reset();
    } else {
      setStatus('error');
    }
  }

  if (status === 'ok') {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-xl text-emerald-600">✓</div>
        <p className="text-sm font-medium text-[var(--dark)]">{t('contactSent')}</p>
        <p className="text-xs text-[var(--mid)]">{t('contactSentSubtitle')}</p>
      </div>
    );
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <input type="hidden" name="ref" value={propertyRef} />
      <div>
        <label htmlFor="pc-nombre" className="mb-1.5 block text-[13px] text-[var(--mid)]">{t('contactNamePlaceholder')}</label>
        <input id="pc-nombre" type="text" name="nombre" required autoComplete="name" className="w-full rounded-[var(--radius-input)] border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--rose)]" />
      </div>
      <div>
        <label htmlFor="pc-email" className="mb-1.5 block text-[13px] text-[var(--mid)]">Email</label>
        <input id="pc-email" type="email" name="email" required autoComplete="email" className="w-full rounded-[var(--radius-input)] border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--rose)]" />
      </div>
      <div>
        <label htmlFor="pc-tel" className="mb-1.5 block text-[13px] text-[var(--mid)]">{t('contactPhonePlaceholder')}</label>
        <input id="pc-tel" type="tel" name="telefono" autoComplete="tel" className="w-full rounded-[var(--radius-input)] border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--rose)]" />
      </div>
      <div>
        <label htmlFor="pc-msg" className="sr-only">Mensaje</label>
        <textarea
          id="pc-msg" name="mensaje" rows={3} required
          className="w-full rounded-[var(--radius-input)] border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--rose)] resize-none"
          defaultValue={t('contactMessageDefault', { ref: propertyRef })}
        />
      </div>
      {status === 'error' && (
        <p className="text-xs text-red-700">{t('contactError')}</p>
      )}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="btn btn-rose w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'sending' ? t('contactSending') : t('contactSubmit')}
      </button>
    </form>
  );
}
