import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getAlternates } from '@/lib/seo';
import ValuationSection from '@/components/sell/ValuationSection';
import SellProcess from '@/components/sell/SellProcess';
import SellFaq from '@/components/sell/SellFaq';
import SellZonesLinks from '@/components/sell/SellZonesLinks';
import ScrollRevealInit from '@/components/ui/ScrollRevealInit';
import { Check } from '@phosphor-icons/react/ssr';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('sell');
  return {
    title: 'Vender tu inmueble | LuxHome',
    description: t('subtitle'),
    alternates: getAlternates('/vender-mi-inmueble'),
  };
}

const headingStyle = { fontSize: 'clamp(34px, 4vw, 56px)', letterSpacing: '-0.015em' } as const;

export default async function SellPage() {
  const t = await getTranslations('sell');
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

      <div className="pt-2 md:pt-3">
        <ValuationSection title={t('form.title')} text={t('form.text')} />
      </div>

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

      <SellProcess />

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

      <SellZonesLinks title="Valoramos inmuebles en el Vallès y Barcelona" />

      <SellFaq title={t('faq.title')} items={faqItems} />
    </>
  );
}
