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
    'Inmobiliaria en el Vallès Occidental. Bego, Vanesa, Mónica y Josep te ayudan a comprar, vender o alquilar en Santa Perpètua, Castelldefels, Vilanova del Vallès y alrededores.',
  keywords: [
    'inmobiliaria vallès occidental',
    'comprar piso santa perpètua de mogoda',
    'vender casa vallès occidental',
    'alquiler piso barcelona nord',
    'inmobiliaria santa perpètua de mogoda',
    'pisos en venta montcada i reixac',
    'casas en venta vilanova del vallès',
    'inmobiliaria les franqueses del vallès',
    'comprar casa barcelona norte',
    'agencia inmobiliaria b-30',
    'pisos segunda mano vallès occidental',
    'obra nueva vallès occidental',
    'lux home inmobiliaria',
    'luxhome inmobiliaria',
  ],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: BASE_URL,
    siteName: 'LuxHome Inmobiliaria',
    title: 'LuxHome — Inmobiliaria en el Vallès Occidental',
    description:
      'Compra, vende o alquila con Bego, Vanesa, Mónica y Josep. Especialistas en el Vallès Occidental y alrededores.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'LuxHome Inmobiliaria' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LuxHome — Inmobiliaria en el Vallès Occidental',
    description: 'Compra, vende o alquila con Bego, Vanesa, Mónica y Josep. Especialistas en el Vallès Occidental.',
  },
  robots: { index: true, follow: true },
};

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: 'LuxHome Inmobiliaria',
  description: 'Inmobiliaria en el Vallès Occidental especializada en compra, venta y alquiler de propiedades. Bego, Vanesa, Mónica y Josep te acompañan desde la primera visita hasta la firma ante notario.',
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  image: `${BASE_URL}/logo.png`,
  telephone: '+34691294443',
  email: 'bego@luxhomein.com',
  priceRange: '€€',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Rambla 27',
    postalCode: '08130',
    addressLocality: 'Santa Perpètua de Mogoda',
    addressRegion: 'Barcelona',
    addressCountry: 'ES',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 41.5225,
    longitude: 2.1863,
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
    { '@type': 'City', name: 'Santa Perpètua de Mogoda' },
    { '@type': 'City', name: 'Montcada i Reixac' },
    { '@type': 'City', name: 'Vilanova del Vallès' },
    { '@type': 'City', name: 'Castelldefels' },
    { '@type': 'City', name: 'Sant Adrià de Besòs' },
    { '@type': 'City', name: 'Les Franqueses del Vallès' },
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+34691294443',
    contactType: 'customer service',
    availableLanguage: ['Spanish', 'Catalan'],
  },
  sameAs: [
    'https://www.instagram.com/luxhome_inmobiliaria',
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
