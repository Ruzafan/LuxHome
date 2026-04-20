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
        <p className="text-[var(--navy)] font-semibold text-sm">{t('contactSent')}</p>
        <p className="text-gray-400 text-xs">{t('contactSentSubtitle')}</p>
      </div>
    );
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <input type="hidden" name="ref" value={propertyRef} />
      <input
        type="text" name="nombre" placeholder={t('contactNamePlaceholder')} required
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
      />
      <input
        type="email" name="email" placeholder="Email" required
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
      />
      <input
        type="tel" name="telefono" placeholder={t('contactPhonePlaceholder')}
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
      />
      <textarea
        name="mensaje" rows={3} required
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
        defaultValue={t('contactMessageDefault', { ref: propertyRef })}
      />
      {status === 'error' && (
        <p className="text-xs text-red-500">{t('contactError')}</p>
      )}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full py-3 gold-gradient text-[var(--navy)] font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed text-sm"
      >
        {status === 'sending' ? t('contactSending') : t('contactSubmit')}
      </button>
    </form>
  );
}
