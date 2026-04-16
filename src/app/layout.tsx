import type { Metadata } from 'next';
import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google';
import './globals.css';
import SiteShell from '@/components/layout/SiteShell';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | LuxHome',
    default: 'LuxHome — Inmobiliaria en el Vallès Occidental',
  },
  description:
    'Lux Home Inmobiliaria: compra, vende y alquila con un equipo de asesores expertos en el Vallès Occidental y alrededores. Pisos, casas, chalets y más.',
  keywords: ['inmobiliaria vallès occidental', 'comprar piso santa perpètua', 'vender casa vallès', 'alquiler piso barcelona nord'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#faf8f3]">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
