import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { InstagramLogo } from '@phosphor-icons/react/ssr';

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
    'Vallès Occidental',
    'Vallès Oriental',
    'Barcelona',
    'Maresme',
    'Barcelonès',
    'Baix Llobregat',
  ];

  return (
    <footer className="px-2 pb-2 pt-2 md:px-3 md:pb-3 md:pt-3">
      <div
        className="rounded-[var(--radius-panel)] px-6 pb-10 pt-14 md:px-12 md:pt-20 lg:px-20"
        style={{ background: 'var(--dark)', color: 'oklch(100% 0 0 / 0.55)', fontSize: '13px', fontWeight: 300 }}
      >
        {/* Top grid */}
        <div
          className="grid grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-8 md:gap-12 pb-12 md:pb-16 mb-9"
          style={{ borderBottom: '1px solid oklch(100% 0 0 / 0.08)' }}
        >
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
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
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors hover:bg-white/10 hover:text-white"
              style={{ borderColor: 'oklch(100% 0 0 / 0.2)', color: 'oklch(100% 0 0 / 0.45)' }}
            >
              <InstagramLogo size={18} weight="light" />
            </a>
          </div>

          {/* Propiedades */}
          <div>
            <h4 className="mb-5 text-[14px] font-normal text-white">
              {t('properties')}
            </h4>
            <ul className="space-y-2.5">
              {propertyLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-[14px] transition-colors hover:text-white"
                    style={{ color: 'oklch(100% 0 0 / 0.45)' }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/vender-mi-inmueble"
              className="mt-5 inline-block text-[14px] text-[var(--rose)] transition-opacity hover:opacity-70"
            >
              Vender mi inmueble
            </Link>
          </div>

          {/* Zonas */}
          <div>
            <h4 className="mb-5 text-[14px] font-normal text-white">
              {t('zones')}
            </h4>
            <ul className="space-y-2.5">
              {zones.map((zone) => (
                <li key={zone} className="text-[14px]" style={{ color: 'oklch(100% 0 0 / 0.45)' }}>
                  {zone}
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="mb-5 text-[14px] font-normal text-white">
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
