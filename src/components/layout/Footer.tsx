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
    <footer style={{ background: 'var(--dark)', color: 'oklch(100% 0 0 / 0.55)', fontSize: '13px', fontWeight: 300 }}>
      <div className="px-12 pt-20 pb-10">
        {/* Top grid */}
        <div
          className="grid gap-12 pb-16 mb-9"
          style={{
            gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
            borderBottom: '1px solid oklch(100% 0 0 / 0.08)',
          }}
        >
          {/* Brand */}
          <div>
            <Image
              src="/logo.png"
              alt="LuxHome Inmobiliaria"
              width={140}
              height={48}
              className="h-10 w-auto object-contain brightness-0 invert mb-4"
            />
            <p className="text-[13px] leading-[1.7] max-w-[260px] mb-6" style={{ color: 'oklch(100% 0 0 / 0.45)' }}>
              {t('description')}
            </p>
            <a
              href="https://www.instagram.com/luxhome_inmob/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram de LuxHome"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full border transition-colors"
              style={{ borderColor: 'oklch(100% 0 0 / 0.2)', color: 'oklch(100% 0 0 / 0.45)' }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
          </div>

          {/* Propiedades */}
          <div>
            <h4 className="text-white text-[11px] font-medium tracking-[0.16em] uppercase mb-5">
              {t('properties')}
            </h4>
            <ul className="space-y-2.5">
              {propertyLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-[13px] transition-colors"
                    style={{ color: 'oklch(100% 0 0 / 0.45)' }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Zonas */}
          <div>
            <h4 className="text-white text-[11px] font-medium tracking-[0.16em] uppercase mb-5">
              {t('zones')}
            </h4>
            <ul className="space-y-2.5">
              {zones.map((zone) => (
                <li key={zone}>
                  <Link
                    href={`/propiedades?ciudad=${encodeURIComponent(zone)}`}
                    className="text-[13px] transition-colors"
                    style={{ color: 'oklch(100% 0 0 / 0.45)' }}
                  >
                    {zone}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-white text-[11px] font-medium tracking-[0.16em] uppercase mb-5">
              {t('contact')}
            </h4>
            <div className="space-y-3 text-[13px]" style={{ color: 'oklch(100% 0 0 / 0.45)', lineHeight: 1.8 }}>
              <p>Rambla 27<br />08130 Santa Perpètua de Mogoda</p>
              <p>
                <a href="tel:+34691294443" className="transition-colors hover:text-white">
                  +34 691 294 443
                </a>
              </p>
              <p>
                <a href="mailto:bego@luxhomein.com" className="transition-colors hover:text-white">
                  bego@luxhomein.com
                </a>
              </p>
              <p className="text-[12px]" style={{ color: 'oklch(100% 0 0 / 0.3)' }}>
                {t('hours')}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <span className="text-[12px]" style={{ color: 'oklch(100% 0 0 / 0.3)' }}>
            {t('rights', { year: new Date().getFullYear() })}
          </span>
          <div className="flex gap-6">
            <Link href="/privacidad" className="text-[12px] transition-colors hover:text-white/60" style={{ color: 'oklch(100% 0 0 / 0.3)' }}>{t('privacy')}</Link>
            <Link href="/cookies" className="text-[12px] transition-colors hover:text-white/60" style={{ color: 'oklch(100% 0 0 / 0.3)' }}>{t('cookies')}</Link>
            <Link href="/aviso-legal" className="text-[12px] transition-colors hover:text-white/60" style={{ color: 'oklch(100% 0 0 / 0.3)' }}>{t('legal')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
