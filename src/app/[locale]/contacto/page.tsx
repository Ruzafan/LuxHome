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
  return <ContactoClient />;
}
