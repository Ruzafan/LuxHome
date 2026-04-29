import type { Metadata } from 'next';
import React from 'react';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getFeaturedProperties, getAllLocations, getStats } from '@/lib/propertyService';
import PropertyCard from '@/components/properties/PropertyCard';
import HeroSearchBar from '@/components/ui/HeroSearchBar';
import TestimonialsSlider from '@/components/ui/TestimonialsSlider';
import ScrollRevealInit from '@/components/ui/ScrollRevealInit';
import { getAlternates } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('home');
  return {
    title: 'LuxHome — Inmobiliaria en el Vallès Occidental',
    description: t('subtitle'),
    alternates: getAlternates('/'),
    openGraph: {
      title: 'LuxHome — Inmobiliaria en el Vallès Occidental',
      description: t('subtitle'),
      url: 'https://luxhomein.com',
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'LuxHome Inmobiliaria' }],
    },
  };
}

const serviceKeys = ['sale', 'personal', 'rental', 'newBuild', 'mortgage', 'docs'] as const;

export default async function HomePage() {
  const [t, featured, locations, stats] = await Promise.all([
    getTranslations('home'),
    getFeaturedProperties(4),
    getAllLocations(),
    getStats(),
  ]);

  const testimonials = [
    { name: 'Fernando R.', initials: 'FR', role: 'Vendedor · Google', text: 'Ya conocía a Begoña y a su equipo desde hace más de 5 años, que vendieron el piso de mi madre en tiempo récord. Hace dos meses volví a confiar en ellas para vender mi piso y ha sido una grata experiencia: se han encargado de todo haciendo que sea fácil y rápido. Son muy buenas profesionales, con experiencia y gran conocimiento del mercado inmobiliario, transmitiendo confianza, seguridad y claridad. Cien por cien recomendables.', stars: 5 },
    { name: 'Desiré A.', initials: 'DA', role: 'Compradores · Google', text: 'Somos Desiré y Rubén y hemos comprado nuestro primer hogar con esta encantadora agencia. Un 10 desde el principio hasta el final. El trato de las chicas, tanto de Begoña como de Mónica, ha sido una maravilla: amabilidad total y súper profesionales. Remarcar a Begoña, que ha estado a nuestro lado durante TODO el proceso, aclarándonos las mil y una dudas, siempre disponible y con una paciencia increíble.', stars: 5 },
    { name: 'Karol F.', initials: 'KF', role: 'Vendedora · Google', text: '100% recomendable. Este equipo no solo sabe hacer bien su trabajo de manera eficaz e impecable, sino que además todo lo que conlleva la venta de una casa (papeles, burocracia, visitas y seguimiento…) es un gran alivio cuando lo dejas en manos de profesionales. Si tuviera que hacer de nuevo una gestión de tal envergadura, sin lugar a dudas las elegiría a ellas.', stars: 5 },
  ];

  return (
    <>
      <ScrollRevealInit />

      {/* ─── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden" style={{ height: '100vh', minHeight: '640px' }}>
        {/* Ken Burns background */}
        <div
          className="absolute inset-0 hero-ken-burns bg-center bg-cover"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80')" }}
        />
        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, oklch(14% 0.012 230 / 0.55) 0%, oklch(14% 0.012 230 / 0.38) 50%, oklch(14% 0.012 230 / 0.68) 100%)' }}
        />
        {/* Content */}
        <div className="relative z-10 text-center px-6 w-full max-w-[820px] mx-auto">
          <span className="inline-block text-[11px] font-medium tracking-[0.22em] uppercase mb-7" style={{ color: 'oklch(100% 0 0 / 0.65)' }}>
            {t('badge')}
          </span>
          <h1
            className="font-light text-white leading-[1.05] mb-5"
            style={{
              fontFamily: 'var(--font-cormorant), Georgia, serif',
              fontSize: 'clamp(52px, 7vw, 96px)',
              letterSpacing: '-0.01em',
            }}
          >
            {t('title')}
          </h1>
          <p className="font-light tracking-[0.03em] mb-12" style={{ fontSize: '15px', color: 'oklch(100% 0 0 / 0.68)' }}>
            {t('subtitle')}
          </p>
          <HeroSearchBar locations={locations} />
        </div>
        {/* Scroll cue */}
        <div className="absolute bottom-9 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[10px] font-light tracking-[0.2em] uppercase" style={{ color: 'oklch(100% 0 0 / 0.45)' }}>
          <div className="w-px h-10 scroll-line-anim" style={{ background: 'oklch(100% 0 0 / 0.3)' }} />
          <span>Scroll</span>
        </div>
      </section>

      {/* ─── Stats ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3" style={{ borderBottom: '1px solid oklch(0% 0% 0% / 0.08)' }}>
        {[
          { value: String(stats.total), label: t('stats.properties') },
          { value: '4', label: t('stats.experts') },
          { value: String(stats.zones), label: t('stats.zones') },
        ].map(({ value, label }, i) => (
          <div
            key={label}
            className="reveal py-8 md:py-12 px-4 md:px-10 text-center"
            style={{ borderRight: i < 2 ? '1px solid oklch(0% 0% 0% / 0.08)' : 'none' }}
          >
            <span
              className="block font-light leading-none mb-1 md:mb-2"
              style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 'clamp(32px, 6vw, 56px)', color: 'var(--dark)' }}
            >
              {value}
            </span>
            <span className="text-[10px] md:text-[11px] font-medium tracking-[0.1em] md:tracking-[0.15em] uppercase" style={{ color: 'var(--subtle)' }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* ─── Featured Properties ───────────────────────────────────────────────── */}
      <section className="py-16 md:py-[100px] px-4 md:px-12">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8 md:mb-14 reveal">
          <div>
            <span className="block text-[11px] font-medium tracking-[0.2em] uppercase mb-4" style={{ color: 'var(--accent)' }}>
              {t('featured.badge')}
            </span>
            <h2
              className="font-light leading-[1.1]"
              style={{
                fontFamily: 'var(--font-cormorant), Georgia, serif',
                fontSize: 'clamp(36px, 4vw, 56px)',
                color: 'var(--dark)',
                letterSpacing: '-0.01em',
              }}
            >
              {t('featured.title')}
            </h2>
          </div>
          <Link
            href="/propiedades"
            className="text-[12px] font-medium tracking-[0.12em] uppercase pb-0.5 transition-opacity hover:opacity-65"
            style={{ color: 'var(--accent)', borderBottom: '1px solid var(--accent)' }}
          >
            {t('featured.viewAll')}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[2px]">
          {featured.map((property, i) => (
            <div key={property.id} className={`reveal${i > 0 ? ` reveal-delay-${i}` : ''}`}>
              <PropertyCard property={property} featured />
            </div>
          ))}
        </div>
      </section>

      {/* ─── Why LuxHome ──────────────────────────────────────────────────────── */}
      <section
        className="grid grid-cols-1 md:grid-cols-[1fr_1.6fr]"
        style={{ borderTop: '1px solid oklch(0% 0% 0% / 0.08)' }}
      >
        {/* Left: dark panel */}
        <div
          className="flex flex-col justify-center px-8 py-16 md:px-16 md:py-[100px] reveal"
          style={{ background: 'var(--dark)' }}
        >
          <span className="block text-[11px] font-medium tracking-[0.2em] uppercase mb-4" style={{ color: 'oklch(100% 0 0 / 0.4)' }}>
            {t('services.badge')}
          </span>
          <h2
            className="font-light leading-[1.1] text-white"
            style={{
              fontFamily: 'var(--font-cormorant), Georgia, serif',
              fontSize: 'clamp(36px, 4vw, 56px)',
              letterSpacing: '-0.01em',
            }}
          >
            {t('services.title')}
          </h2>
          <p className="mt-6 text-[15px] font-light leading-[1.75] md:max-w-[340px]" style={{ color: 'oklch(100% 0 0 / 0.55)' }}>
            Bego, Vanesa, Mónica y Josep te acompañan personalmente desde la primera visita hasta la firma ante notario, con total transparencia en cada paso.
          </p>
        </div>

        {/* Right: service grid */}
        <div className="grid grid-cols-2">
          {serviceKeys.map((key, i) => (
            <div
              key={key}
              className="reveal group transition-colors duration-300 hover:bg-white px-6 py-8 md:px-10 md:py-12"
              style={{
                borderBottom: i < serviceKeys.length - 2 ? '1px solid oklch(0% 0% 0% / 0.07)' : 'none',
                borderRight: i % 2 === 0 ? '1px solid oklch(0% 0% 0% / 0.07)' : 'none',
              }}
            >
              <span
                className="block font-light tracking-[0.12em] mb-3 md:mb-4"
                style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: '13px', color: 'var(--accent)' }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3
                className="font-normal mb-2 leading-[1.2]"
                style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 'clamp(17px, 2vw, 20px)', color: 'var(--dark)' }}
              >
                {t(`services.${key}.title`)}
              </h3>
              <p className="text-[12px] md:text-[13px] font-light leading-[1.7]" style={{ color: 'var(--mid)' }}>
                {t(`services.${key}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Team ─────────────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-[100px] px-4 md:px-12" style={{ background: 'var(--bg)' }}>
        <div className="mb-8 md:mb-14 reveal">
          <span className="block text-[11px] font-medium tracking-[0.2em] uppercase mb-4" style={{ color: 'var(--accent)' }}>
            El equipo
          </span>
          <h2
            className="font-light leading-[1.1]"
            style={{
              fontFamily: 'var(--font-cormorant), Georgia, serif',
              fontSize: 'clamp(36px, 4vw, 56px)',
              color: 'var(--dark)',
              letterSpacing: '-0.01em',
            }}
          >
            Las personas<br />detrás de <em>LuxHome</em>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.6fr] gap-[2px] reveal">
          <div className="relative overflow-hidden" style={{ aspectRatio: '16/10' }}>
            <Image
              src="/team.jpeg"
              alt="Equipo LuxHome"
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          </div>

          {/* Bio */}
          <div className="flex flex-col justify-center px-6 py-10 md:px-16 md:py-14 bg-white">
            <p
              className="font-light leading-[1.4] mb-5"
              style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 'clamp(22px, 3vw, 28px)', color: 'var(--dark)' }}
            >
              <em>Bego, Vanesa,<br />Mónica</em> y Josep
            </p>
            <p className="text-[14px] font-light leading-[1.8] mb-8" style={{ color: 'var(--mid)' }}>
              Un equipo con años de experiencia en el sector inmobiliario del Vallès Occidental. Te acompañamos desde la primera visita hasta la firma ante notario, con trato cercano, honesto y profesional en cada paso del camino.
            </p>
            <div className="flex gap-6 md:gap-10">
              {[
                { num: '+10', label: 'Años de experiencia' },
                { num: '5★', label: 'Valoración media' },
              ].map(({ num, label }) => (
                <div key={label}>
                  <span
                    className="block font-light leading-none mb-1"
                    style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 'clamp(28px, 4vw, 36px)', color: 'var(--dark)' }}
                  >
                    {num}
                  </span>
                  <span className="text-[10px] md:text-[11px] font-medium tracking-[0.13em] uppercase" style={{ color: 'var(--subtle)' }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-[100px] px-4 md:px-12 relative overflow-hidden" style={{ background: 'var(--dark)' }}>
        {/* Giant quote decoration */}
        <span
          className="absolute pointer-events-none select-none leading-[0.8]"
          style={{
            fontFamily: 'var(--font-cormorant), Georgia, serif',
            fontSize: '400px',
            color: 'oklch(100% 0 0 / 0.04)',
            top: '40px',
            left: '32px',
          }}
          aria-hidden
        >
          &ldquo;
        </span>

        <div className="relative z-10">
          <span className="block text-[11px] font-medium tracking-[0.2em] uppercase mb-4" style={{ color: 'oklch(100% 0 0 / 0.35)' }}>
            {t('testimonials.badge')}
          </span>
          <h2
            className="font-light leading-[1.1] mb-16"
            style={{
              fontFamily: 'var(--font-cormorant), Georgia, serif',
              fontSize: 'clamp(36px, 4vw, 56px)',
              color: 'white',
              letterSpacing: '-0.01em',
            }}
          >
            {t('testimonials.title')}
          </h2>
          <TestimonialsSlider testimonials={testimonials} />
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2">
        {/* Image */}
        <div
          className="bg-center bg-cover min-h-[220px] md:min-h-[400px]"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80')" }}
        />
        {/* Content */}
        <div className="flex flex-col justify-center px-6 py-12 md:px-[72px] md:py-20 reveal" style={{ background: 'var(--bg2)' }}>
          <span className="block text-[11px] font-medium tracking-[0.2em] uppercase mb-4" style={{ color: 'var(--accent)' }}>
            Contacto
          </span>
          <h2
            className="font-light leading-[1.1] mb-4"
            style={{
              fontFamily: 'var(--font-cormorant), Georgia, serif',
              fontSize: 'clamp(36px, 4vw, 56px)',
              color: 'var(--dark)',
              letterSpacing: '-0.01em',
            }}
          >
            {t('cta.title')}
          </h2>
          <p className="text-[15px] font-light leading-[1.75] mb-9 max-w-[380px]" style={{ color: 'var(--mid)' }}>
            {t('cta.subtitle')}
          </p>
          <Link
            href="/contacto"
            className="self-start text-[12px] font-medium tracking-[0.14em] uppercase px-9 py-4 transition-colors"
            style={{ background: 'var(--rose)', color: 'var(--dark)' }}
          >
            {t('cta.button')}
          </Link>
        </div>
      </section>
    </>
  );
}
