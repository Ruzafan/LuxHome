import type { Metadata } from 'next';
import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

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
    default: 'LuxHome — Propiedades de Lujo en Barcelona y Costa Brava',
  },
  description:
    'Especialistas en propiedades exclusivas en Barcelona y la Costa Brava. Pisos, chalets, áticos y villas de lujo en venta y alquiler.',
  keywords: ['inmobiliaria lujo', 'propiedades barcelona', 'chalets costa brava', 'pisos exclusivos'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#faf8f3]">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
