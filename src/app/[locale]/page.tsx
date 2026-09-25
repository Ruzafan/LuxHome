import type { Metadata } from 'next';
import React from 'react';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getFeaturedProperties, getAllLocations, getStats } from '@/lib/propertyService';
import PropertyCard from '@/components/properties/PropertyCard';
import HeroSearchBar from '@/components/ui/HeroSearchBar';
import ScrollRevealInit from '@/components/ui/ScrollRevealInit';
import { getAlternates } from '@/lib/seo';
import {
  ArrowRight, Bank, FileText, HandHeart, Handshake, Key, Buildings, Star,
} from '@phosphor-icons/react/ssr';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('home');
  return {
    title: 'LuxHome | Inmobiliaria en el Vallès Occidental',
    description: t('subtitle'),
    alternates: getAlternates('/'),
    openGraph: {
      title: 'LuxHome | Inmobiliaria en el Vallès Occidental',
      description: t('subtitle'),
      url: 'https://luxhomein.com',
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'LuxHome Inmobiliaria' }],
    },
  };
}

const services = [
  { key: 'sale', Icon: Handshake },
  { key: 'personal', Icon: HandHeart },
  { key: 'rental', Icon: Key },
  { key: 'newBuild', Icon: Buildings },
  { key: 'mortgage', Icon: Bank },
  { key: 'docs', Icon: FileText },
] as const;

// Short excerpts from real Google reviews
const testimonials = [
  {
    name: 'Fernando R.',
    role: 'Vendió su piso con LuxHome',
    text: 'Se han encargado de todo, haciendo que sea fácil y rápido. Transmiten confianza, seguridad y claridad. Cien por cien recomendables.',
  },
  {
    name: 'Desiré y Rubén',
    role: 'Compraron su primer hogar',
    text: 'Un 10 desde el principio hasta el final. Amabilidad total y súper profesionales.',
  },
  {
    name: 'Karol F.',
    role: 'Vendió su casa con LuxHome',
    text: 'Todo lo que conlleva vender una casa es un gran alivio cuando lo dejas en manos de profesionales.',
  },
];

const headingStyle: React.CSSProperties = {
  fontSize: 'clamp(36px, 4.4vw, 60px)',
  letterSpacing: '-0.015em',
};

export default async function HomePage() {
  const [t, featured, locations, stats, sellT] = await Promise.all([
    getTranslations('home'),
    getFeaturedProperties(5),
    getAllLocations(),
    getStats(),
    getTranslations('sell'),
  ]);

  const schemaOrgJSONLD = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': 'https://luxhomein.com/#organization',
    name: 'LuxHome Inmobiliaria',
    url: 'https://luxhomein.com',
    logo: 'https://luxhomein.com/logo.png',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
    description: 'Inmobiliaria boutique en el Vallès Occidental especializada en la compra, venta y alquiler de viviendas exclusivas.',
    telephone: '+34691294443',
    email: 'info@luxhomein.com',
    priceRange: '€€€',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Sabadell',
      addressRegion: 'Barcelona',
      addressCountry: 'ES',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 41.5463,
      longitude: 2.1086,
    },
    areaServed: [
      'Sabadell',
      'Terrassa',
      'Sant Cugat del Vallès',
      'Castellar del Vallès',
      'Cerdanyola del Vallès',
      'Barberà del Vallès',
      'Sant Quirze del Vallès',
      'Rubí',
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:30',
        closes: '19:30',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5.0',
      reviewCount: '48',
    },
  };

  // Bento needs exactly 5 cells (1 large + 4); otherwise fall back to an even grid
  const bento = featured.length === 5;
  const [mainQuote, ...sideQuotes] = testimonials;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrgJSONLD) }}
      />
      <ScrollRevealInit />

      {/* ─── Hero: framed photo, content anchored bottom-left ─────────────────── */}
      <section className="px-2 pt-2 md:px-3 md:pt-3">
        <div className="relative isolate flex min-h-[calc(100dvh-16px)] items-end overflow-hidden rounded-[var(--radius-panel)] md:min-h-[calc(100dvh-24px)]">
          <div className="hero-ken-burns absolute inset-0 -z-20">
            <Image
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=2000&q=80"
              alt=""
              fill
              preload
              sizes="100vw"
              className="object-cover"
            />
          </div>
          <div
            className="absolute inset-0 -z-10"
            style={{
              background:
                'linear-gradient(90deg, oklch(15% 0.02 340 / 0.55) 0%, oklch(15% 0.02 340 / 0) 60%), linear-gradient(180deg, oklch(15% 0.02 340 / 0.45) 0%, oklch(15% 0.02 340 / 0.05) 30%, oklch(15% 0.02 340 / 0.3) 55%, oklch(15% 0.02 340 / 0.85) 100%)',
            }}
          />

          <div className="container-lux pb-6 pt-32 md:pb-10">
            <div className="max-w-[760px] animate-fade-in">
              <p className="mb-5 text-[13px] font-normal" style={{ color: 'oklch(100% 0 0 / 0.78)' }}>
                {t('badge')}
              </p>
              <h1
                className="font-display mb-5 font-light leading-[1.02] text-white"
                style={{ fontSize: 'clamp(48px, 7vw, 104px)', letterSpacing: '-0.02em' }}
              >
                {t('title')}
              </h1>
              <p className="mb-9 max-w-[520px] text-[17px] leading-[1.6]" style={{ color: 'oklch(100% 0 0 / 0.82)' }}>
                {t('heroText')}
              </p>
            </div>
            <div className="max-w-[1100px] animate-fade-in" style={{ animationDelay: '0.15s' }}>
              <HeroSearchBar locations={locations} />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Featured properties: asymmetric bento ───────────────────────────── */}
      <section className="container-lux py-20 md:py-28">
        <div className="reveal mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-14">
          <h2 className="font-display max-w-[14ch] font-light leading-[1.05]" style={headingStyle}>
            {t('featured.title')}
          </h2>
          <Link
            href="/propiedades"
            className="group inline-flex items-center gap-2 text-[14px] font-medium"
            style={{ color: 'var(--accent)' }}
          >
            {t('featured.viewAll')}
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--rose-soft)] transition-transform duration-300 group-hover:translate-x-1">
              <ArrowRight size={16} />
            </span>
          </Link>
        </div>

        {bento ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:gap-5">
            {featured.map((property, i) => (
              <div
                key={property.id}
                className={`reveal ${i > 0 ? `reveal-delay-${i}` : ''} ${
                  i === 0 ? 'sm:col-span-2 lg:col-span-6 lg:row-span-2' : 'lg:col-span-3'
                }`}
              >
                <PropertyCard property={property} size={i === 0 ? 'large' : 'default'} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {featured.map((property, i) => (
              <div key={property.id} className={`reveal ${i > 0 ? `reveal-delay-${Math.min(i, 4)}` : ''}`}>
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── Why LuxHome: inset dark panel ───────────────────────────────────── */}
      <section className="px-2 md:px-3">
        <div
          className="reveal relative overflow-hidden rounded-[var(--radius-panel)] px-6 py-16 md:px-12 md:py-24 lg:px-20"
          style={{ background: 'var(--dark)' }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full opacity-40 blur-3xl"
            style={{ background: 'radial-gradient(circle, #9a5b7b 0%, transparent 70%)' }}
          />
          <div className="relative mx-auto grid max-w-[1240px] grid-cols-1 gap-12 lg:grid-cols-[0.85fr_1.4fr] lg:gap-20">
            <div>
              <h2 className="font-display font-light leading-[1.05] text-white" style={headingStyle}>
                {t('services.title')}
              </h2>
            </div>

            <ul className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2">
              {services.map(({ key, Icon }, i) => (
                <li key={key} className={`reveal reveal-delay-${(i % 2) + 1} flex gap-4`}>
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                    style={{ background: 'oklch(100% 0 0 / 0.08)', color: 'var(--rose)' }}
                  >
                    <Icon size={20} weight="light" />
                  </span>
                  <div>
                    <h3 className="mb-1.5 text-[17px] font-normal text-white">{t(`services.${key}.title`)}</h3>
                    <p className="text-[14px] leading-[1.7]" style={{ color: 'oklch(100% 0 0 / 0.55)' }}>
                      {t(`services.${key}.desc`)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ─── Team: photo with overlapping card ───────────────────────────────── */}
      <section className="container-lux py-20 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:items-end">
          <div className="reveal relative aspect-[4/3] overflow-hidden rounded-[var(--radius-panel)] lg:col-span-8 lg:col-start-1 lg:row-start-1 lg:aspect-[16/11]">
            <Image
              src="/team.jpeg"
              alt="Josep, Bego, Mónica y Vanesa en la oficina de LuxHome"
              fill
              className="object-cover object-[center_35%]"
              sizes="(max-width: 1024px) 100vw, 66vw"
            />
          </div>

          <div
            className="reveal reveal-delay-2 relative z-10 mx-3 -mt-16 rounded-[var(--radius-card)] bg-white p-7 md:mx-8 md:p-10 lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:mx-0 lg:-mb-16 lg:mt-0"
            style={{ boxShadow: 'var(--shadow-lift)' }}
          >
            <p className="mb-4 text-[13px]" style={{ color: 'var(--accent)' }}>
              {t('team.badge')}
            </p>
            <h2 className="font-display mb-4 font-light leading-[1.08]" style={{ fontSize: 'clamp(32px, 3.2vw, 44px)' }}>
              {t('team.title')}
            </h2>
            <p className="font-display mb-4 text-[22px] italic leading-[1.3]" style={{ color: 'var(--accent)' }}>
              Bego, Vanesa, Mónica y Josep
            </p>
            <p className="mb-8 text-[15px] leading-[1.75]" style={{ color: 'var(--mid)' }}>
              {t('team.text')}
            </p>

            <dl className="grid grid-cols-2 gap-x-6 gap-y-6">
              {[
                { value: '+10', label: t('team.years') },
                { value: '5,0', label: t('team.rating') },
                { value: String(stats.total), label: t('stats.properties') },
                { value: String(stats.zones), label: t('stats.zones') },
              ].map(({ value, label }) => (
                <div key={label}>
                  <dt className="sr-only">{label}</dt>
                  <dd>
                    <span className="font-display block text-[40px] font-light leading-none">{value}</span>
                    <span className="mt-1.5 block text-[13px]" style={{ color: 'var(--subtle)' }}>{label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ─── Testimonials: one large quote + two small ───────────────────────── */}
      <section className="container-lux pb-20 md:pb-28">
        <div className="reveal mb-10 md:mb-14">
          <h2 className="font-display font-light leading-[1.05]" style={headingStyle}>
            {t('testimonials.title')}
          </h2>
          <p className="mt-4 flex items-center gap-2 text-[14px]" style={{ color: 'var(--mid)' }}>
            <span className="flex gap-0.5" style={{ color: 'var(--accent)' }} aria-label="5 de 5 estrellas">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={15} weight="fill" />
              ))}
            </span>
            {t('reviewsNote')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
          <figure
            className="reveal flex flex-col justify-between gap-10 rounded-[var(--radius-panel)] p-8 md:p-12 lg:col-span-7"
            style={{ background: 'var(--rose-soft)' }}
          >
            <blockquote
              className="font-display font-light italic leading-[1.25]"
              style={{ fontSize: 'clamp(26px, 2.6vw, 36px)', color: 'var(--dark)' }}
            >
              &ldquo;{mainQuote.text}&rdquo;
            </blockquote>
            <figcaption>
              <span className="block text-[16px] font-normal">{mainQuote.name}</span>
              <span className="text-[14px]" style={{ color: 'var(--mid)' }}>{mainQuote.role}</span>
            </figcaption>
          </figure>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1 lg:gap-5">
            {sideQuotes.map((q, i) => (
              <figure
                key={q.name}
                className={`reveal reveal-delay-${i + 1} flex flex-col justify-between gap-6 rounded-[var(--radius-card)] bg-white p-7 md:p-8`}
                style={{ boxShadow: 'inset 0 0 0 1px var(--line)' }}
              >
                <blockquote className="text-[17px] leading-[1.6]" style={{ color: 'var(--dark)' }}>
                  &ldquo;{q.text}&rdquo;
                </blockquote>
                <figcaption>
                  <span className="block text-[15px] font-normal">{q.name}</span>
                  <span className="text-[13px]" style={{ color: 'var(--mid)' }}>{q.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA: framed photo card ──────────────────────────────────────────── */}
      <section className="px-2 pb-2 md:px-3 md:pb-3">
        <div className="reveal relative isolate overflow-hidden rounded-[var(--radius-panel)]">
          <Image
            src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1800&q=80"
            alt=""
            fill
            sizes="100vw"
            className="-z-20 object-cover"
          />
          <div
            className="absolute inset-0 -z-10"
            style={{ background: 'linear-gradient(90deg, oklch(15% 0.02 340 / 0.88) 0%, oklch(15% 0.02 340 / 0.55) 55%, oklch(15% 0.02 340 / 0.2) 100%)' }}
          />
          <div className="container-lux py-20 md:py-28">
            <h2 className="font-display max-w-[16ch] font-light leading-[1.05] text-white" style={headingStyle}>
              {t('cta.title')}
            </h2>
            <p className="mt-5 max-w-[46ch] text-[16px] leading-[1.7]" style={{ color: 'oklch(100% 0 0 / 0.75)' }}>
              {t('cta.subtitle')}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/contacto" className="btn btn-rose">
                {t('cta.button')}
              </Link>
              <Link href="/vender-mi-inmueble" className="btn btn-ghost-light">
                {sellT('cta')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
