'use client';

import Image from 'next/image';
import { Link, usePathname } from '@/i18n/navigation';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function Navbar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isHome = pathname === '/';
  const transparent = isHome && !scrolled && !menuOpen;

  const links = [
    { href: '/' as const, label: t('home') },
    { href: '/propiedades' as const, label: t('properties') },
    { href: '/contacto' as const, label: t('contact') },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={
        transparent
          ? {}
          : {
              background: 'oklch(98.5% 0.004 240 / 0.92)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 1px 0 oklch(0% 0% 0% / 0.07)',
            }
      }
    >
      <div className="px-12 flex items-center justify-between h-[72px]">
        {/* Logo */}
        <Link href="/">
          <Image
            src="/logo.png"
            alt="LuxHome Inmobiliaria"
            width={140}
            height={48}
            className="h-10 w-auto object-contain"
            style={{ filter: transparent ? 'brightness(0) invert(1)' : 'none' }}
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-9">
          {links.map(({ href, label }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className="text-[13px] font-medium tracking-[0.1em] uppercase transition-colors duration-200"
                style={{
                  color: transparent
                    ? active ? 'white' : 'oklch(100% 0 0 / 0.82)'
                    : active ? 'var(--dark)' : 'var(--mid)',
                }}
              >
                {label}
              </Link>
            );
          })}

          <Link
            href="/contacto"
            className="text-[12px] font-medium tracking-[0.12em] uppercase px-6 py-2.5 transition-all duration-200"
            style={{ background: 'var(--rose)', color: 'var(--dark)' }}
          >
            {t('requestVisit')}
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Menú"
        >
          <span
            className="block w-6 h-px transition-all duration-300"
            style={{
              background: transparent ? 'white' : 'var(--dark)',
              transform: menuOpen ? 'rotate(45deg) translate(0, 6px)' : 'none',
            }}
          />
          <span
            className="block w-6 h-px transition-all duration-300"
            style={{
              background: transparent ? 'white' : 'var(--dark)',
              opacity: menuOpen ? 0 : 1,
            }}
          />
          <span
            className="block w-6 h-px transition-all duration-300"
            style={{
              background: transparent ? 'white' : 'var(--dark)',
              transform: menuOpen ? 'rotate(-45deg) translate(0, -6px)' : 'none',
            }}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden px-6 py-6 flex flex-col gap-4 border-t"
          style={{
            background: 'oklch(98.5% 0.004 240 / 0.96)',
            backdropFilter: 'blur(16px)',
            borderColor: 'oklch(0% 0% 0% / 0.07)',
          }}
        >
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="text-[13px] font-medium tracking-[0.1em] uppercase py-2 border-b transition-colors"
              style={{ color: 'var(--mid)', borderColor: 'oklch(0% 0% 0% / 0.07)' }}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/contacto"
            onClick={() => setMenuOpen(false)}
            className="mt-1 text-center text-[12px] font-medium tracking-[0.12em] uppercase px-6 py-3"
            style={{ background: 'var(--rose)', color: 'var(--dark)' }}
          >
            {t('requestVisit')}
          </Link>
        </div>
      )}
    </header>
  );
}
