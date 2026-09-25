import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getAlternates } from '@/lib/seo';
import ContactoClient from './ContactoClient';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('contact');
  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: getAlternates('/contacto'),
  };
}

export default function ContactoPage() {
  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contacto | LuxHome Inmobiliaria',
    description: 'Ponte en contacto con nuestro equipo inmobiliario en el Vallès Occidental. Atención telefónica, WhatsApp y correo.',
    url: 'https://luxhomein.com/contacto',
    mainEntity: {
      '@type': 'RealEstateAgent',
      name: 'LuxHome Inmobiliaria',
      telephone: '+34691294443',
      email: 'info@luxhomein.com',
      url: 'https://luxhomein.com',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Sabadell',
        addressRegion: 'Barcelona',
        addressCountry: 'ES',
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />
      <ContactoClient />
    </>
  );
}
