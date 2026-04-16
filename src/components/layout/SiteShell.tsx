'use client';

/**
 * SiteShell — muestra Navbar/Footer/CookieBanner solo en páginas del sitio,
 * no en rutas /admin/* que tienen su propio layout.
 */
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import CookieBanner from '@/components/ui/CookieBanner';

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CookieBanner />
    </>
  );
}
