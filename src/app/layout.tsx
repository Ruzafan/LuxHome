import type { Metadata } from 'next';
import { Geist_Mono, Cormorant_Garamond, Jost } from 'next/font/google';
import './globals.css';

const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
});
const jost = Jost({
  variable: '--font-jost',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
});

const BASE_URL = 'https://luxhomein.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    template: '%s | LuxHome',
    default: 'LuxHome — Inmobiliaria en el Vallès Occidental',
  },
  description:
    'Inmobiliaria en el Vallès Occidental. Mónica, Vanesa, Bego y Josep te ayudan a comprar, vender o alquilar en Santa Perpètua, Castelldefels, Vilanova del Vallès y alrededores.',
  keywords: [
    'inmobiliaria vallès occidental',
    'comprar piso santa perpètua de mogoda',
    'vender casa vallès occidental',
    'alquiler piso barcelona nord',
  ],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: BASE_URL,
    siteName: 'LuxHome Inmobiliaria',
    title: 'LuxHome — Inmobiliaria en el Vallès Occidental',
    description:
      'Compra, vende o alquila con Mónica, Vanesa, Bego y Josep. Especialistas en el Vallès Occidental y alrededores.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'LuxHome Inmobiliaria' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LuxHome — Inmobiliaria en el Vallès Occidental',
    description: 'Compra, vende o alquila con Mónica, Vanesa, Bego y Josep. Especialistas en el Vallès Occidental.',
  },
  robots: { index: true, follow: true },
};

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: 'LuxHome Inmobiliaria',
  url: BASE_URL,
  telephone: '+34691294443',
  email: 'bego@luxhomein.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Rambla 27',
    postalCode: '08130',
    addressLocality: 'Santa Perpètua de Mogoda',
    addressRegion: 'Barcelona',
    addressCountry: 'ES',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:30',
      closes: '13:30',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '16:00',
      closes: '19:00',
    },
  ],
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
    <html lang="es" className={`${cormorant.variable} ${jost.variable} ${geistMono.variable}`}>
      <body className="min-h-screen flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        {children}
      </body>
    </html>
  );
}
