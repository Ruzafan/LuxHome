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

const BASE_URL = 'https://luxhomein.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    template: '%s | LuxHome',
    default: 'LuxHome — Inmobiliaria en el Vallès Occidental',
  },
  description:
    'Inmobiliaria en el Vallès Occidental. Mónica, Vanesa y Bego te ayudan a comprar, vender o alquilar en Santa Perpètua, Castelldefels, Vilanova del Vallès y alrededores.',
  keywords: [
    'inmobiliaria vallès occidental',
    'comprar piso santa perpètua de mogoda',
    'vender casa vallès occidental',
    'alquiler piso barcelona nord',
    'inmobiliaria montcada i reixac',
    'chalets vilanova del vallès',
  ],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: BASE_URL,
    siteName: 'LuxHome Inmobiliaria',
    title: 'LuxHome — Inmobiliaria en el Vallès Occidental',
    description:
      'Inmobiliaria en el Vallès Occidental. Mónica, Vanesa y Bego te ayudan a comprar, vender o alquilar en Santa Perpètua, Castelldefels y alrededores.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'LuxHome Inmobiliaria — Vallès Occidental',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LuxHome — Inmobiliaria en el Vallès Occidental',
    description:
      'Compra, vende o alquila con Mónica, Vanesa y Bego. Especialistas en el Vallès Occidental y alrededores.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: 'LuxHome Inmobiliaria',
  url: BASE_URL,
  telephone: '+34931057965',
  email: 'monica@luxhomein.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Rambla 27',
    postalCode: '08130',
    addressLocality: 'Santa Perpètua de Mogoda',
    addressRegion: 'Barcelona',
    addressCountry: 'ES',
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '09:30',
    closes: '19:00',
  },
  areaServed: [
    'Santa Perpètua de Mogoda',
    'Montcada i Reixac',
    'Vilanova del Vallès',
    'Castelldefels',
    'Sant Adrià de Besòs',
    'Les Franqueses del Vallès',
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#faf8f3]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
