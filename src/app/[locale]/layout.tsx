import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CookieBanner from '@/components/ui/CookieBanner';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import CompareDrawer from '@/components/ui/CompareDrawer';
import MortgageCalculatorModal from '@/components/ui/MortgageCalculatorModal';
import PropertyQuickView from '@/components/properties/PropertyQuickView';
import PropertyWizardModal from '@/components/ui/PropertyWizardModal';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CookieBanner />
      <WhatsAppButton />
      <CompareDrawer />
      <MortgageCalculatorModal />
      <PropertyQuickView />
      <PropertyWizardModal />
    </NextIntlClientProvider>
  );
}
