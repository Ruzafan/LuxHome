import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getAlternates } from '@/lib/seo';
import ContactoClient from '../contacto/ContactoClient';
import ScrollRevealInit from '@/components/ui/ScrollRevealInit';
import { Ear, ChartLineUp, Megaphone, Handshake, Check, Plus } from '@phosphor-icons/react/ssr';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('sell');
  return {
    title: 'Vender tu inmueble | LuxHome',
    description: t('subtitle'),
    alternates: getAlternates('/vender-mi-inmueble'),
  };
}

const stepIcons = [Ear, ChartLineUp, Megaphone, Handshake];
// Staircase offset on desktop so the steps read as a progression, not a flat row
const stepOffsets = ['', 'lg:mt-10', 'lg:mt-20', 'lg:mt-30'];

const headingStyle = { fontSize: 'clamp(34px, 4vw, 56px)', letterSpacing: '-0.015em' } as const;

export default async function SellPage() {
  const t = await getTranslations('sell');
  const steps = t.raw('process.steps') as Array<{ title: string; text: string }>;
  const points = t.raw('trust.points') as string[];
  const faqItems = t.raw('faq.items') as Array<{ question: string; answer: string }>;

  return (
    <>
      <ScrollRevealInit />

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="px-2 pt-2 md:px-3 md:pt-3">
        <div className="relative isolate flex min-h-[640px] items-end overflow-hidden rounded-[var(--radius-panel)] md:min-h-[82dvh]">
          <Image
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=2000&q=80"
            alt=""
            fill
            preload
            sizes="100vw"
            className="-z-20 object-cover"
          />
          <div
            className="absolute inset-0 -z-10"
            style={{ background: 'linear-gradient(90deg, oklch(15% 0.02 340 / 0.85) 0%, oklch(15% 0.02 340 / 0.45) 55%, oklch(15% 0.02 340 / 0.15) 100%)' }}
          />
          <div className="container-lux animate-fade-in pb-12 pt-32 md:pb-20">
            <p className="mb-5 text-[13px]" style={{ color: 'var(--rose)' }}>{t('badge')}</p>
            <h1
              className="font-display max-w-[15ch] font-light leading-[1.02] text-white"
              style={{ fontSize: 'clamp(46px, 6.4vw, 92px)', letterSpacing: '-0.02em' }}
            >
              {t('title')}
            </h1>
            <p className="mt-6 max-w-[48ch] text-[17px] leading-[1.65]" style={{ color: 'oklch(100% 0 0 / 0.78)' }}>
              {t('subtitle')}
            </p>
            <Link href="#valoracion" className="btn btn-rose mt-9">
              {t('cta')}
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Trust ────────────────────────────────────────────────────────── */}
      <section className="container-lux grid grid-cols-1 gap-12 py-20 md:py-28 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
        <div className="reveal">
          <h2 className="font-display max-w-[18ch] font-light leading-[1.06]" style={headingStyle}>
            {t('trust.title')}
          </h2>
          <p className="mt-6 max-w-[52ch] text-[16px] leading-[1.75]" style={{ color: 'var(--mid)' }}>
            {t('trust.text')}
          </p>
        </div>
        <ul className="flex flex-col gap-3 self-center">
          {points.map((point, i) => (
            <li
              key={point}
              className={`reveal reveal-delay-${i + 1} flex items-center gap-4 rounded-full bg-white py-3 pl-3 pr-6 text-[15px]`}
              style={{ boxShadow: 'inset 0 0 0 1px var(--line)' }}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--rose-soft)] text-[var(--accent)]">
                <Check size={16} weight="bold" />
              </span>
              {point}
            </li>
          ))}
        </ul>
      </section>

      {/* ─── Process: staggered steps ─────────────────────────────────────── */}
      <section className="px-2 md:px-3">
        <div className="rounded-[var(--radius-panel)] py-20 md:py-28" style={{ background: 'var(--bg2)' }}>
          <div className="container-lux">
            <h2 className="reveal font-display max-w-[20ch] font-light leading-[1.06]" style={headingStyle}>
              {t('process.title')}
            </h2>
            <ol className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              {steps.map((step, i) => {
                const Icon = stepIcons[i] ?? Check;
                return (
                  <li
                    key={step.title}
                    className={`reveal reveal-delay-${i + 1} flex flex-col rounded-[var(--radius-card)] bg-white p-7 ${stepOffsets[i] ?? ''}`}
                  >
                    <span className="mb-10 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--dark)] text-[var(--rose)]">
                      <Icon size={22} weight="light" />
                    </span>
                    <h3 className="font-display text-[26px] font-light leading-[1.15]">{step.title}</h3>
                    <p className="mt-3 text-[15px] leading-[1.7]" style={{ color: 'var(--mid)' }}>{step.text}</p>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      {/* ─── Quote ────────────────────────────────────────────────────────── */}
      <section className="container-lux py-20 md:py-28">
        <figure className="reveal mx-auto max-w-[900px] text-center">
          <blockquote
            className="font-display font-light italic leading-[1.2]"
            style={{ fontSize: 'clamp(28px, 3.4vw, 46px)' }}
          >
            &ldquo;{t('testimonials.quote')}&rdquo;
          </blockquote>
          <figcaption className="mt-7 text-[15px]" style={{ color: 'var(--mid)' }}>
            {t('testimonials.author')}
          </figcaption>
        </figure>
      </section>

      {/* ─── Valuation form ───────────────────────────────────────────────── */}
      <section id="valoracion" className="scroll-mt-24 px-2 md:px-3">
        <div className="rounded-[var(--radius-panel)] py-16 md:py-24" style={{ background: 'var(--rose-soft)' }}>
          <div className="container-lux max-w-6xl">
            <p className="mb-4 text-[13px]" style={{ color: 'var(--accent)' }}>{t('form.badge')}</p>
            <h2 className="font-display max-w-[18ch] font-light leading-[1.06]" style={headingStyle}>
              {t('form.title')}
            </h2>
            <p className="mt-4 max-w-[56ch] text-[15px] leading-[1.7]" style={{ color: 'var(--mid)' }}>
              {t('form.text')} {t('form.privacy')}
            </p>
          </div>
          <ContactoClient initialSubject="valoracion" compact />
        </div>
      </section>

      {/* ─── FAQ: accordion ───────────────────────────────────────────────── */}
      <section className="container-lux grid grid-cols-1 gap-10 py-20 md:py-28 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <h2 className="reveal font-display font-light leading-[1.06]" style={headingStyle}>
          {t('faq.title')}
        </h2>
        <div className="flex flex-col gap-3">
          {faqItems.map((item, i) => (
            <details
              key={item.question}
              className={`reveal reveal-delay-${i + 1} group rounded-[var(--radius-card)] bg-white px-6 py-5 open:pb-6`}
              style={{ boxShadow: 'inset 0 0 0 1px var(--line)' }}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[17px] font-normal [&::-webkit-details-marker]:hidden">
                {item.question}
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--bg2)] transition-transform duration-300 group-open:rotate-45">
                  <Plus size={16} />
                </span>
              </summary>
              <p className="mt-3 max-w-[60ch] text-[15px] leading-[1.7]" style={{ color: 'var(--mid)' }}>
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
