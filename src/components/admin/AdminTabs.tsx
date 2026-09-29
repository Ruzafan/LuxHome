'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/admin', label: 'Resumen' },
  { href: '/admin/solicitudes', label: 'Solicitudes' },
  { href: '/admin/estadisticas', label: 'Estadísticas' },
] as const;

export default function AdminTabs() {
  const pathname = usePathname();
  return (
    <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto" aria-label="Secciones del panel">
      {TABS.map(({ href, label }) => {
        const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`whitespace-nowrap border-b-2 px-4 pb-3 pt-1 text-sm transition-colors ${
              active ? 'border-[var(--rose)] text-white' : 'border-transparent text-white/50 hover:text-white/80'
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
