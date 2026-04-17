import type { Metadata } from 'next';
import React from 'react';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getFeaturedProperties, getAllLocations, getStats, getPropertyCountByCity } from '@/lib/propertyService';
import PropertyCard from '@/components/properties/PropertyCard';
import QuickSearch from '@/components/ui/QuickSearch';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('home');
  return {
    title: 'LuxHome — Inmobiliaria en el Vallès Occidental',
    description: t('subtitle'),
    openGraph: {
      title: 'LuxHome — Inmobiliaria en el Vallès Occidental',
      description: t('subtitle'),
      url: 'https://luxhomein.com',
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'LuxHome Inmobiliaria' }],
    },
  };
}

export default async function HomePage() {
  const [t, featured, locations, stats, cityCount] = await Promise.all([
    getTranslations('home'),
    getFeaturedProperties(4),
    getAllLocations(),
    getStats(),
    getPropertyCountByCity(),
  ]);

  const serviceKeys = ['sale', 'personal', 'rental', 'newBuild', 'mortgage', 'docs'] as const;
  const serviceIcons: Record<string, React.ReactNode> = {
    sale: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.125 1.125 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>,
    personal: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
    rental: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" /></svg>,
    newBuild: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>,
    mortgage: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    docs: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>,
  };

  const zones = [
    { label: 'Santa Perpètua de Mogoda', img: 'https://images.pexels.com/photos/5751184/pexels-photo-5751184.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { label: 'Castelldefels', img: 'https://images.pexels.com/photos/20370118/pexels-photo-20370118.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { label: 'Vilanova del Vallès', img: 'https://images.pexels.com/photos/10673908/pexels-photo-10673908.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { label: 'Montcada i Reixac', img: 'https://images.pexels.com/photos/12017937/pexels-photo-12017937.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { label: 'Sant Adrià de Besòs', img: 'https://images.pexels.com/photos/9255685/pexels-photo-9255685.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { label: 'Les Franqueses del Vallès', img: 'https://images.pexels.com/photos/34807091/pexels-photo-34807091.jpeg?auto=compress&cs=tinysrgb&w=400' },
  ];

  const testimonials = [
    { name: 'Jordi P.', role: 'Comprador — Santa Perpètua de Mogoda', text: 'Mónica nos ayudó a encontrar exactamente lo que buscábamos. Trato cercano, muy profesional y siempre disponible para resolver nuestras dudas. Totalmente recomendable.', stars: 5 },
    { name: 'Marta G.', role: 'Vendedora — Ático Santa Perpètua', text: 'Vendieron mi piso mucho más rápido de lo que esperaba y al precio que pedíamos. El equipo de Lux Home conoce muy bien la zona y saben cómo llegar a los compradores.', stars: 5 },
    { name: 'Família Soler', role: 'Compradores — Casa adosada Vallès', text: 'Vanesa y Bego fueron un apoyo fundamental durante todo el proceso. Gestionaron todo, desde la visita hasta la firma. Nos sentimos acompañados en todo momento.', stars: 5 },
  ];

  return (
    <>
      {/* ─── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920"
            alt="Propiedad de LuxHome"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 luxury-gradient opacity-75" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pb-20 md:pb-0">
          <p className="text-[#c9a84c] text-sm font-semibold tracking-[0.3em] uppercase mb-4 animate-fade-in">
            {t('badge')}
          </p>
          <h1
            className="text-white font-bold leading-tight mb-6 animate-fade-in"
            style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(2.5rem, 6vw, 5rem)', animationDelay: '0.1s' }}
          >
            {t('title')}
          </h1>
          <p
            className="text-white/75 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto animate-fade-in"
            style={{ animationDelay: '0.2s' }}
          >
            {t('subtitle')}
          </p>

          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <QuickSearch locations={locations} />
          </div>

          <div className="grid grid-cols-3 gap-4 md:gap-8 mt-8 md:mt-16 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            {[
              { value: String(stats.total), label: t('stats.properties') },
              { value: '3', label: t('stats.experts') },
              { value: String(stats.zones), label: t('stats.zones') },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-[#c9a84c] font-bold text-2xl md:text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>
                  {value}
                </p>
                <p className="text-white/60 text-xs md:text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-white/40 text-xs">
          <span>{t('scrollHint')}</span>
          <div className="w-px h-8 bg-white/30 animate-bounce" />
        </div>
      </section>

      {/* ─── Featured Properties ───────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#faf8f3]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#c9a84c] text-sm font-semibold tracking-[0.3em] uppercase mb-2">{t('featured.badge')}</p>
            <h2
              className="text-[#0f1f3d] font-bold text-4xl gold-line gold-line-center"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {t('featured.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {featured.map((property) => (
              <PropertyCard key={property.id} property={property} featured />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/propiedades"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded border-2 border-[#0f1f3d] text-[#0f1f3d] font-semibold hover:bg-[#0f1f3d] hover:text-white transition-all duration-300"
            >
              {t('featured.viewAll')}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Why LuxHome ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 luxury-gradient">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#c9a84c] text-sm font-semibold tracking-[0.3em] uppercase mb-2">{t('services.badge')}</p>
            <h2 className="text-white font-bold text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>
              {t('services.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {serviceKeys.map((key) => (
              <div
                key={key}
                className="text-center p-8 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="w-14 h-14 rounded-full gold-gradient flex items-center justify-center mx-auto mb-5 text-[#0f1f3d]">
                  {serviceIcons[key]}
                </div>
                <h3 className="text-white font-semibold text-xl mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>
                  {t(`services.${key}.title`)}
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">{t(`services.${key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Zonas ────────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#c9a84c] text-sm font-semibold tracking-[0.3em] uppercase mb-2">{t('zones.badge')}</p>
            <h2
              className="text-[#0f1f3d] font-bold text-4xl gold-line gold-line-center"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {t('zones.title')}
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
            {zones.map(({ label, img }) => (
              <Link
                key={label}
                href={`/propiedades?ciudad=${encodeURIComponent(label)}`}
                className="group relative rounded-xl overflow-hidden block aspect-[4/3] md:aspect-[3/4]"
              >
                <Image
                  src={img}
                  alt={label}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white font-semibold text-sm">{label}</p>
                  {(cityCount[label] ?? 0) > 0 && (
                    <p className="text-[#c9a84c] text-xs">{cityCount[label]} {t('zones.properties')}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#faf8f3]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#c9a84c] text-sm font-semibold tracking-[0.3em] uppercase mb-2">{t('testimonials.badge')}</p>
            <h2
              className="text-[#0f1f3d] font-bold text-4xl gold-line gold-line-center"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {t('testimonials.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {testimonials.map(({ name, role, text, stars }) => (
              <div key={name} className="bg-white rounded-xl p-6 shadow-md">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: stars }).map((_, i) => (
                    <span key={i} className="text-[#c9a84c] text-lg">★</span>
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 italic">&ldquo;{text}&rdquo;</p>
                <div>
                  <p className="font-semibold text-[#0f1f3d] text-sm">{name}</p>
                  <p className="text-gray-400 text-xs">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 gold-gradient">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-[#0f1f3d] font-bold text-4xl mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
            {t('cta.title')}
          </h2>
          <p className="text-[#0f1f3d]/70 text-lg mb-8">{t('cta.subtitle')}</p>
          <Link
            href="/contacto"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#0f1f3d] text-white font-semibold rounded hover:bg-[#1a3260] transition-colors"
          >
            {t('cta.button')}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
