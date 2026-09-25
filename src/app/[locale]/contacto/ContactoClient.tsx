'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useState } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import { CheckCircle, Clock, EnvelopeSimple, MapPin, Phone, WhatsappLogo } from '@phosphor-icons/react';

export default function ContactoClient({ initialSubject = '', compact = false }: { initialSubject?: string; compact?: boolean }) {
  const t = useTranslations('contact');
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      setStatus('ok');
      form.reset();
    } else {
      setStatus('error');
    }
  }

  return (
    <div className={compact ? '' : 'bg-[var(--cream)]'}>
      {!compact && <PageHeader eyebrow={t('badge')} title={t('title')} subtitle={t('subtitle')} />}

      <div className={`container-lux max-w-6xl ${compact ? 'pt-10' : 'py-16 md:py-20'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Contact Form — order-2 on mobile so info panel appears first */}
          <div className="order-2 rounded-[var(--radius-panel)] bg-white p-7 md:p-10 lg:order-1 lg:col-span-3" style={{ boxShadow: 'var(--shadow-soft)' }}>
            <h2 className="font-display mb-1 text-[32px] font-light text-[var(--dark)]">
              {t('form.title')}
            </h2>
            <p className="mb-8 text-[15px] text-[var(--mid)]">{t('form.subtitle')}</p>

            {status === 'ok' ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--rose-soft)] text-[var(--accent)]"><CheckCircle size={32} weight="light" /></span>
                <p className="font-display text-[26px] font-light text-[var(--dark)]">{t('form.successTitle')}</p>
                <p className="text-sm text-[var(--mid)]">{t('form.successSubtitle')}</p>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="nombre" className="mb-2 block text-[13px] text-[var(--mid)]">
                      {t('form.name')}
                    </label>
                    <input id="nombre" type="text" name="nombre" required
                      className="w-full rounded-[var(--radius-input)] border border-[var(--line)] bg-[var(--bg)] px-4 py-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[var(--rose)]" />
                  </div>
                  <div>
                    <label htmlFor="apellidos" className="mb-2 block text-[13px] text-[var(--mid)]">
                      {t('form.surname')}
                    </label>
                    <input id="apellidos" type="text" name="apellidos" required
                      className="w-full rounded-[var(--radius-input)] border border-[var(--line)] bg-[var(--bg)] px-4 py-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[var(--rose)]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="mb-2 block text-[13px] text-[var(--mid)]">
                      {t('form.email')}
                    </label>
                    <input id="email" type="email" name="email" required
                      className="w-full rounded-[var(--radius-input)] border border-[var(--line)] bg-[var(--bg)] px-4 py-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[var(--rose)]" />
                  </div>
                  <div>
                    <label htmlFor="telefono" className="mb-2 block text-[13px] text-[var(--mid)]">
                      {t('form.phone')} <span className="text-[var(--subtle)]">{t('form.phoneOptional')}</span>
                    </label>
                    <input id="telefono" type="tel" name="telefono"
                      className="w-full rounded-[var(--radius-input)] border border-[var(--line)] bg-[var(--bg)] px-4 py-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[var(--rose)]" />
                  </div>
                </div>

                <div>
                  <label htmlFor="asunto" className="mb-2 block text-[13px] text-[var(--mid)]">
                    {t('form.subject')}
                  </label>
                  <select id="asunto" name="asunto" defaultValue={initialSubject}
                    className="w-full rounded-[var(--radius-input)] border border-[var(--line)] bg-[var(--bg)] px-4 py-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[var(--rose)]">
                    <option value="" disabled>{t('form.subjectPlaceholder')}</option>
                    <option value="comprar">{t('form.subjectBuy')}</option>
                    <option value="alquilar">{t('form.subjectRent')}</option>
                    <option value="vender">{t('form.subjectSell')}</option>
                    <option value="inversion">{t('form.subjectInvest')}</option>
                    <option value="valoracion">{t('form.subjectValuation')}</option>
                    <option value="otro">{t('form.subjectOther')}</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="presupuesto" className="mb-2 block text-[13px] text-[var(--mid)]">
                    {t('form.budget')}
                  </label>
                  <select id="presupuesto" name="presupuesto" defaultValue=""
                    className="w-full rounded-[var(--radius-input)] border border-[var(--line)] bg-[var(--bg)] px-4 py-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[var(--rose)]">
                    <option value="">{t('form.budgetNone')}</option>
                    <option value="100k-200k">100.000€ - 200.000€</option>
                    <option value="200k-400k">200.000€ - 400.000€</option>
                    <option value="400k-700k">400.000€ - 700.000€</option>
                    <option value="+700k">Más de 700.000€</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="mensaje" className="mb-2 block text-[13px] text-[var(--mid)]">
                    {t('form.message')}
                  </label>
                  <textarea id="mensaje" name="mensaje" rows={4} required
                    placeholder={t('form.messagePlaceholder')}
                    className="w-full rounded-[var(--radius-input)] border border-[var(--line)] bg-[var(--bg)] px-4 py-3.5 text-[15px] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--rose)]" />
                </div>

                <div className="flex items-start gap-3">
                  <input type="checkbox" id="privacidad" name="privacidad" required className="mt-1 accent-[var(--rose)]" />
                  <label htmlFor="privacidad" className="text-[13px] leading-relaxed text-[var(--mid)]">
                    {t.rich('form.privacy', {
                      link: (chunks) => (
                        <Link href="/privacidad" className="underline hover:opacity-70" style={{ color: 'var(--rose-dark)' }}>
                          {chunks}
                        </Link>
                      ),
                    })}
                  </label>
                </div>

                {status === 'error' && (
                  <p className="text-sm text-red-700">{t('form.errorMessage')}</p>
                )}

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="btn btn-primary w-full !py-4 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === 'sending' ? t('form.sending') : t('form.submit')}
                </button>
              </form>
            )}
          </div>

          {/* Info panel — order-1 on mobile so it appears above the form */}
          <div className="lg:col-span-2 order-1 lg:order-2 space-y-6">
            <div className="rounded-[var(--radius-panel)] bg-white p-7" style={{ boxShadow: 'inset 0 0 0 1px var(--line)' }}>
              <h3 className="font-display mb-5 text-[26px] font-light text-[var(--dark)]">
                {t('office')}
              </h3>
              <ul className="space-y-4 text-[15px] text-[var(--mid)]">
                <li className="flex items-start gap-3">
                  <MapPin size={18} weight="light" className="mt-0.5 shrink-0 text-[var(--accent)]" />
                  <span>Rambla 27<br />08130 Santa Perpètua de Mogoda (Barcelona)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={18} weight="light" className="shrink-0 text-[var(--accent)]" />
                  <a href="tel:+34691294443" className="hover:text-[var(--accent)] transition-colors">+34 691 294 443</a>
                </li>
                <li className="flex items-center gap-3">
                  <EnvelopeSimple size={18} weight="light" className="shrink-0 text-[var(--accent)]" />
                  <a href="mailto:bego@luxhomein.com" className="hover:text-[var(--accent)] transition-colors">
                    bego@luxhomein.com
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Clock size={18} weight="light" className="mt-0.5 shrink-0 text-[var(--accent)]" />
                  <span className="text-[14px]">{t('hours')}</span>
                </li>
              </ul>
            </div>

            <div className="rounded-[var(--radius-panel)] p-7 text-white" style={{ background: 'var(--dark)' }}>
              <h3 className="font-display mb-2 text-[26px] font-light">{t('whatsapp.title')}</h3>
              <p className="mb-6 text-[15px] text-white/65">{t('whatsapp.subtitle')}</p>
              <a
                href="https://wa.me/34691294443?text=Hola,%20me%20interesa%20una%20propiedad%20de%20LuxHome"
                className="btn w-full bg-[#1f9d55] text-white hover:bg-[#188a49]"
              >
                <WhatsappLogo size={18} weight="fill" /> {t('whatsapp.button')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
