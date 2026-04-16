'use client';

import Image from 'next/image';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import type { Locale } from '@/i18n/routing';

const localeNames: Record<Locale, string> = { es: 'ES', ca: 'CA', en: 'EN' };
const locales: Locale[] = ['es', 'ca', 'en'];

export default function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isHome = pathname === '/';
  const transparent = isHome && !scrolled && !menuOpen;

  const links = [
    { href: '/' as const, label: t('home') },
    { href: '/propiedades' as const, label: t('properties') },
    { href: '/sobre-nosotros' as const, label: t('about') },
    { href: '/contacto' as const, label: t('contact') },
  ];

  function switchLocale(newLocale: Locale) {
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        transparent ? 'bg-transparent' : 'bg-[#0f1f3d] shadow-lg'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="LuxHome Inmobiliaria"
            width={160}
            height={56}
            className="h-12 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map(({ href, label }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`text-sm font-medium tracking-wide transition-colors duration-200 ${
                  active ? 'text-[#c9a84c]' : 'text-white/80 hover:text-[#c9a84c]'
                }`}
              >
                {label}
              </Link>
            );
          })}
          <Link
            href="/contacto"
            className="ml-2 px-5 py-2.5 rounded text-sm font-semibold tracking-wide text-[#0f1f3d] gold-gradient hover:opacity-90 transition-opacity"
          >
            {t('requestVisit')}
          </Link>

          {/* Locale switcher */}
          <div className="flex items-center border border-white/20 rounded-lg overflow-hidden ml-2">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => switchLocale(loc)}
                className={`px-2.5 py-1.5 text-xs font-semibold uppercase transition-colors ${
                  locale === loc
                    ? 'bg-[#c9a84c] text-[#0f1f3d]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {localeNames[loc]}
              </button>
            ))}
          </div>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Menú"
        >
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0f1f3d] border-t border-white/10 px-6 py-4 flex flex-col gap-4">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="text-white/80 hover:text-[#c9a84c] text-sm font-medium py-2 border-b border-white/10"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/contacto"
            onClick={() => setMenuOpen(false)}
            className="mt-2 text-center px-5 py-2.5 rounded text-sm font-semibold text-[#0f1f3d] gold-gradient"
          >
            {t('requestVisit')}
          </Link>
          {/* Locale switcher mobile */}
          <div className="flex items-center gap-2 mt-1">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => { switchLocale(loc); setMenuOpen(false); }}
                className={`px-3 py-1.5 text-xs font-semibold uppercase rounded-lg transition-colors ${
                  locale === loc
                    ? 'bg-[#c9a84c] text-[#0f1f3d]'
                    : 'text-white/60 border border-white/20 hover:text-white'
                }`}
              >
                {localeNames[loc]}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
