import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getStats } from '@/lib/propertyService';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('about');
  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

const team = [
  {
    name: 'Mónica',
    role: 'Fundadora & Agente Principal',
    img: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
    bio: 'Con una larga trayectoria en el sector inmobiliario, Mónica fundó Lux Home con la vocación de ofrecer un servicio honesto, cercano y profesional a cada cliente.',
  },
  {
    name: 'Vanesa',
    role: 'Agente Inmobiliaria',
    img: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400',
    bio: 'Gran conocedora del mercado local del Vallès Occidental. Vanesa destaca por su capacidad de escucha y su habilidad para encontrar la propiedad perfecta para cada familia.',
  },
  {
    name: 'Bego',
    role: 'Agente Inmobiliaria',
    img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
    bio: 'Experta en negociación y tramitación documental. Bego acompaña a los clientes desde la primera visita hasta la firma ante notario con total tranquilidad.',
  },
];

const zoneDescs: Record<string, string> = {
  'Santa Perpètua de Mogoda': 'Nuestra zona principal. Conocemos cada calle, cada urbanización y cada promotor del municipio.',
  'Castelldefels': 'Especialistas en la zona de La Muntanyeta y el litoral del Baix Llobregat.',
  'Vilanova del Vallès': 'Seguimiento activo del mercado residencial y de chalets unifamiliares.',
  'Montcada i Reixac': 'Cobertura en las principales urbanizaciones del municipio.',
  'Sant Adrià de Besòs': 'Propiedades en Sant Adrià Nord y zonas limítrofes con Barcelona.',
  'Les Franqueses del Vallès': 'Acceso a propiedades rústicas, masías y terrenos en el entorno del Vallès Oriental.',
};

export default async function SobreNosotrosPage() {
  const [t, stats] = await Promise.all([
    getTranslations('about'),
    getStats(),
  ]);

  const valueKeys = ['proximity', 'honesty', 'rigor', 'communication'] as const;
  const valueIcons: Record<string, React.ReactNode> = {
    proximity: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
    honesty: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
    rigor: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>,
    communication: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" /></svg>,
  };

  return (
    <div className="pt-20 bg-[#faf8f3]">
      {/* Hero */}
      <section className="relative h-72 md:h-96 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1920"
          alt="Equipo LuxHome"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 luxury-gradient opacity-80" />
        <div className="absolute inset-0 flex items-center justify-center text-center px-6">
          <div>
            <p className="text-[#c9a84c] text-sm font-semibold tracking-[0.3em] uppercase mb-3">{t('badge')}</p>
            <h1 className="text-white font-bold text-4xl md:text-5xl" style={{ fontFamily: 'var(--font-playfair)' }}>
              {t('title')}
            </h1>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-[#0f1f3d] font-bold text-3xl md:text-4xl mb-6 gold-line gold-line-center" style={{ fontFamily: 'var(--font-playfair)' }}>
            {t('subtitle')}
          </h2>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 luxury-gradient">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: String(stats.total), label: 'Propiedades activas' },
              { value: '3', label: 'Agentes especializadas' },
              { value: String(stats.zones), label: 'Zonas de actuación' },
              { value: '3', label: 'Idiomas (ES, CAT, EN)' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-[#c9a84c] font-bold text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>
                  {value}
                </p>
                <p className="text-white/60 text-sm mt-2">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#c9a84c] text-sm font-semibold tracking-[0.3em] uppercase mb-2">{t('team.badge')}</p>
            <h2 className="text-[#0f1f3d] font-bold text-4xl gold-line gold-line-center" style={{ fontFamily: 'var(--font-playfair)' }}>
              {t('team.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {team.map(({ name, role, img, bio }) => (
              <div key={name} className="text-center group">
                <div className="relative w-40 h-40 rounded-full overflow-hidden mx-auto mb-4 ring-4 ring-[#faf8f3] group-hover:ring-[#c9a84c] transition-all duration-300">
                  <Image src={img} alt={name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <h3 className="font-bold text-[#0f1f3d] text-lg" style={{ fontFamily: 'var(--font-playfair)' }}>{name}</h3>
                <p className="text-[#c9a84c] text-sm font-medium mb-3">{role}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6 bg-[#faf8f3]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#c9a84c] text-sm font-semibold tracking-[0.3em] uppercase mb-2">{t('values.badge')}</p>
            <h2 className="text-[#0f1f3d] font-bold text-4xl gold-line gold-line-center" style={{ fontFamily: 'var(--font-playfair)' }}>
              {t('values.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {valueKeys.map((key) => (
              <div key={key} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center text-[#0f1f3d] mb-4">
                  {valueIcons[key]}
                </div>
                <h3 className="text-[#0f1f3d] font-bold text-lg mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
                  {t(`values.${key}.title`)}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{t(`values.${key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Zones */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#c9a84c] text-sm font-semibold tracking-[0.3em] uppercase mb-2">{t('zones.badge')}</p>
            <h2 className="text-[#0f1f3d] font-bold text-4xl gold-line gold-line-center" style={{ fontFamily: 'var(--font-playfair)' }}>
              {t('zones.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Object.entries(zoneDescs).map(([name, desc]) => (
              <Link
                key={name}
                href={`/propiedades?ciudad=${encodeURIComponent(name)}`}
                className="group flex items-start gap-4 p-5 rounded-xl border border-gray-100 hover:border-[#c9a84c] hover:bg-[#faf8f3] transition-all"
              >
                <div className="w-2 h-2 rounded-full bg-[#c9a84c] mt-2 shrink-0 group-hover:scale-150 transition-transform" />
                <div>
                  <p className="font-semibold text-[#0f1f3d] mb-1 group-hover:text-[#c9a84c] transition-colors">{name}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 gold-gradient">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-[#0f1f3d] font-bold text-3xl mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
            {t('cta.title')}
          </h2>
          <p className="text-[#0f1f3d]/70 mb-6">{t('cta.subtitle')}</p>
          <Link
            href="/contacto"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#0f1f3d] text-white font-semibold rounded hover:bg-[#1a3260] transition-colors"
          >
            {t('cta.button')}
          </Link>
        </div>
      </section>
    </div>
  );
}
