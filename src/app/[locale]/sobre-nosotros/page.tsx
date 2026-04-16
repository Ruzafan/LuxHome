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
  const valueIcons: Record<string, string> = {
    proximity: '🤝', honesty: '🔍', rigor: '📋', communication: '💬',
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
                <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center text-2xl mb-4">
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
