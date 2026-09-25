'use client';

import Image from 'next/image';
import { Link, usePathname } from '@/i18n/navigation';
import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Calculator, List, X } from '@phosphor-icons/react';

export default function Navbar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Sentinel at the top of the document: once it leaves the viewport the page has scrolled.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const openMortgage = () => {
    window.dispatchEvent(new CustomEvent('open_mortgage_calculator'));
  };

  const isHome = pathname === '/';
  const transparent = isHome && !scrolled && !menuOpen;

  const links = [
    { href: '/' as const, label: t('home') },
    { href: '/propiedades' as const, label: t('properties') },
    { href: '/vender-mi-inmueble' as const, label: t('sell') },
    { href: '/contacto' as const, label: t('contact') },
  ];

  return (
    <>
      <div ref={sentinelRef} aria-hidden className="pointer-events-none absolute left-0 top-0 h-16 w-px" />
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6">
        <div
          className="mx-auto flex h-16 max-w-[1320px] items-center justify-between rounded-full pl-5 pr-2 transition-all duration-500 md:pl-7"
          style={
            transparent
              ? { background: 'transparent' }
              : {
                  background: 'oklch(99% 0.004 340 / 0.82)',
                  backdropFilter: 'blur(18px) saturate(160%)',
                  WebkitBackdropFilter: 'blur(18px) saturate(160%)',
                  boxShadow: 'inset 0 0 0 1px oklch(19% 0.014 340 / 0.06), 0 10px 30px -12px oklch(30% 0.04 340 / 0.25)',
                }
          }
        >
          <Link href="/" className="shrink-0">
            <Image
              src="/logo.png"
              alt="LuxHome Inmobiliaria"
              width={140}
              height={48}
              className="h-9 w-auto object-contain transition-[filter] duration-500"
              style={{ filter: transparent ? 'brightness(0) invert(1)' : 'none' }}
              preload
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {/* "Vender" lives in the CTA pill on desktop, so it is not repeated as a link */}
            {links.filter(({ href }) => href !== '/vender-mi-inmueble').map(({ href, label }) => {
              const active = pathname === href || (href !== '/' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className="rounded-full px-4 py-2 text-[14px] font-normal transition-colors duration-200"
                  style={{
                    color: transparent
                      ? active ? 'white' : 'oklch(100% 0 0 / 0.8)'
                      : active ? 'var(--dark)' : 'var(--mid)',
                    background: active
                      ? transparent ? 'oklch(100% 0 0 / 0.14)' : 'var(--rose-soft)'
                      : 'transparent',
                  }}
                >
                  {label}
                </Link>
              );
            })}

            <button
              type="button"
              onClick={openMortgage}
              className="flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-[14px] transition-colors"
              style={{ color: transparent ? 'oklch(100% 0 0 / 0.8)' : 'var(--mid)' }}
            >
              <Calculator size={17} weight="light" />
              Hipoteca
            </button>

            <Link href="/vender-mi-inmueble" className="btn btn-rose ml-2 !py-3">
              {t('sell')}
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button
            className="flex h-12 w-12 items-center justify-center rounded-full md:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            style={{ color: transparent ? 'white' : 'var(--dark)' }}
          >
            {menuOpen ? <X size={22} weight="light" /> : <List size={22} weight="light" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            className="glass-panel animate-fade-in mx-auto mt-2 flex max-w-[1320px] flex-col gap-1 rounded-[var(--radius-card)] p-3 md:hidden"
          >
            {links.map(({ href, label }) => {
              const active = pathname === href || (href !== '/' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-2xl px-4 py-3 text-[15px] transition-colors"
                  style={{ color: 'var(--dark)', background: active ? 'var(--rose-soft)' : 'transparent' }}
                >
                  {label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                openMortgage();
              }}
              className="flex items-center gap-2 rounded-2xl px-4 py-3 text-left text-[15px]"
              style={{ color: 'var(--dark)' }}
            >
              <Calculator size={18} weight="light" />
              Calculadora hipotecaria
            </button>
          </div>
        )}
      </header>
    </>
  );
}
