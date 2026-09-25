import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getAlternates } from '@/lib/seo';
import ContactoClient from '../contacto/ContactoClient';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('sell');
  return {
    title: 'Vender tu inmueble | LuxHome',
    description: t('subtitle'),
    alternates: getAlternates('/vender-mi-inmueble'),
  };
}

export default async function SellPage() {
  const t = await getTranslations('sell');
  const steps = t.raw('process.steps') as Array<{ title: string; text: string }>;
  const points = t.raw('trust.points') as string[];
  const faqItems = t.raw('faq.items') as Array<{ question: string; answer: string }>;

  return (
    <>
      <section className="relative flex min-h-[620px] items-end overflow-hidden bg-[var(--dark)] px-6 pb-16 pt-32 md:min-h-[680px] md:px-16 md:pb-24">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-55"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=85')" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,oklch(14%_0.012_230_/_0.88),oklch(14%_0.012_230_/_0.32))]" />
        <div className="relative z-10 max-w-3xl text-white">
          <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--rose)]">{t('badge')}</p>
          <h1 className="max-w-2xl font-light text-5xl leading-[1.02] md:text-7xl" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
            {t('title')}
          </h1>
          <p className="mt-6 max-w-xl text-base font-light leading-7 text-white/75 md:text-lg">{t('subtitle')}</p>
          <Link href="#valoracion" className="mt-9 inline-flex bg-[var(--rose)] px-7 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--dark)] transition-opacity hover:opacity-85">
            {t('cta')}
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2">
        <div className="bg-[var(--dark)] px-6 py-16 text-white md:px-16 md:py-24">
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-white/45">{t('badge')}</p>
          <h2 className="max-w-lg font-light text-4xl leading-tight md:text-5xl" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>{t('trust.title')}</h2>
          <p className="mt-6 max-w-lg text-sm leading-7 text-white/60">{t('trust.text')}</p>
        </div>
        <div className="bg-[var(--bg2)] px-6 py-16 md:px-16 md:py-24">
          <ul className="space-y-7">
            {points.map((point, index) => (
              <li key={point} className="flex gap-5 border-b border-black/10 pb-6 text-sm leading-6 text-[var(--mid)]">
                <span className="font-light text-2xl text-[var(--accent)]" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>{String(index + 1).padStart(2, '0')}</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-6 py-16 md:px-16 md:py-24">
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--accent)]">{t('process.badge')}</p>
        <h2 className="max-w-2xl font-light text-4xl leading-tight text-[var(--dark)] md:text-5xl" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>{t('process.title')}</h2>
        <div className="mt-12 grid grid-cols-1 gap-px bg-black/10 md:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.title} className="bg-[var(--bg)] px-6 py-8 md:min-h-[220px] md:px-7">
              <span className="text-xs font-medium tracking-[0.15em] text-[var(--accent)]">0{index + 1}</span>
              <h3 className="mt-8 font-light text-2xl leading-tight text-[var(--dark)]" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--mid)]">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[var(--dark)] px-6 py-16 text-white md:px-16 md:py-20">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/40">{t('testimonials.badge')}</p>
        <blockquote className="mt-6 max-w-3xl font-light text-3xl leading-tight md:text-5xl" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>“{t('testimonials.quote')}”</blockquote>
        <p className="mt-6 text-xs uppercase tracking-[0.12em] text-white/45">{t('testimonials.author')}</p>
      </section>

      <section id="valoracion" className="bg-[var(--bg2)] px-0 py-12 md:py-20">
        <div className="mx-auto max-w-6xl px-6 md:px-16">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--accent)]">{t('form.badge')}</p>
          <h2 className="mt-4 max-w-2xl font-light text-4xl leading-tight text-[var(--dark)] md:text-5xl" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>{t('form.title')}</h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--mid)]">{t('form.text')} {t('form.privacy')}</p>
        </div>
        <ContactoClient initialSubject="valoracion" compact />
      </section>

      <section className="px-6 py-16 md:px-16 md:py-24">
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--accent)]">{t('faq.badge')}</p>
        <h2 className="font-light text-4xl text-[var(--dark)] md:text-5xl" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>{t('faq.title')}</h2>
        <div className="mt-10 grid max-w-4xl gap-8 md:grid-cols-3">
          {faqItems.map((item) => (
            <div key={item.question} className="border-t border-black/15 pt-5">
              <h3 className="font-medium text-[var(--dark)]">{item.question}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--mid)]">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}