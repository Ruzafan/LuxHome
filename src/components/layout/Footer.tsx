import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';

export default async function Footer() {
  const t = await getTranslations('footer');

  const propertyLinks = [
    { label: t('sale'), href: '/propiedades?operacion=venta' },
    { label: t('rental'), href: '/propiedades?operacion=alquiler' },
    { label: t('newBuild'), href: '/propiedades?tipo=nueva' },
    { label: t('villas'), href: '/propiedades?tipo=chalet' },
    { label: t('apartments'), href: '/propiedades?tipo=piso' },
    { label: t('penthouses'), href: '/propiedades?tipo=atico' },
  ];

  const zones = [
    'Santa Perpètua de Mogoda',
    'Montcada i Reixac',
    'Vilanova del Vallès',
    'Castelldefels',
    'Sant Adrià de Besòs',
    'Les Franqueses del Vallès',
  ];

  return (
    <footer className="bg-[#0f1f3d] text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <Image
                src="/logo.png"
                alt="LuxHome Inmobiliaria"
                width={160}
                height={56}
                className="h-14 w-auto object-contain brightness-0 invert"
              />
            </div>
            <p className="text-white/60 text-sm leading-relaxed">{t('description')}</p>
            <div className="flex gap-3 mt-6">
              <a
                href="https://www.instagram.com/luxhome_inmob/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram de LuxHome Inmobiliaria"
                className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:border-[#c9a84c] hover:text-[#c9a84c] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Propiedades */}
          <div>
            <h3 className="text-[#c9a84c] font-semibold text-sm tracking-widest uppercase mb-4">
              {t('properties')}
            </h3>
            <ul className="space-y-2">
              {propertyLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-white/60 hover:text-[#c9a84c] text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Zonas */}
          <div>
            <h3 className="text-[#c9a84c] font-semibold text-sm tracking-widest uppercase mb-4">
              {t('zones')}
            </h3>
            <ul className="space-y-2">
              {zones.map((zone) => (
                <li key={zone}>
                  <Link
                    href={`/propiedades?ciudad=${encodeURIComponent(zone)}`}
                    className="text-white/60 hover:text-[#c9a84c] text-sm transition-colors"
                  >
                    {zone}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-[#c9a84c] font-semibold text-sm tracking-widest uppercase mb-4">
              {t('contact')}
            </h3>
            <ul className="space-y-3 text-sm text-white/60">
              <li>
                <span className="block text-white/40 text-xs mb-1">{t('office')}</span>
                Rambla 27<br />08130 Santa Perpètua de Mogoda
              </li>
              <li>
                <a href="tel:+34931057965" className="hover:text-[#c9a84c] transition-colors">
                  +34 931 05 79 65
                </a>
              </li>
              <li>
                <a href="mailto:monica@luxhomein.com" className="hover:text-[#c9a84c] transition-colors">
                  monica@luxhomein.com
                </a>
              </li>
              <li>
                <span className="block text-white/40 text-xs mb-1">{t('schedule')}</span>
                {t('hours')}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>{t('rights', { year: new Date().getFullYear() })}</p>
          <div className="flex gap-6">
            <Link href="/privacidad" className="hover:text-white/70 transition-colors">{t('privacy')}</Link>
            <Link href="/cookies" className="hover:text-white/70 transition-colors">{t('cookies')}</Link>
            <Link href="/aviso-legal" className="hover:text-white/70 transition-colors">{t('legal')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
