import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getPropertyById, getRelatedProperties, formatPrice } from '@/lib/propertyService';
import PropertyCard from '@/components/properties/PropertyCard';
import PropertyContactForm from '@/components/properties/PropertyContactForm';
import PropertyGallery from '@/components/properties/PropertyGallery';
import ShareButton from '@/components/properties/ShareButton';
import { getAlternates } from '@/lib/seo';

interface Props {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const property = await getPropertyById(id);
  if (!property) return { title: 'Propiedad no encontrada' };

  const primaryImage = property.images.find((i) => i.isPrimary) ?? property.images[0];
  const description = property.description.slice(0, 160);

  return {
    title: property.title,
    description,
    alternates: getAlternates(`/propiedades/${property.id}`),
    openGraph: {
      title: `${property.title} | LuxHome`,
      description,
      url: `https://luxhomein.com/propiedades/${property.id}`,
      type: 'article',
      ...(primaryImage && {
        images: [{ url: primaryImage.url, width: 1200, height: 800, alt: primaryImage.alt }],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: property.title,
      description,
      ...(primaryImage && { images: [primaryImage.url] }),
    },
  };
}

export default async function PropertyDetailPage({ params }: Props) {
  const { id } = await params;
  const [property, t] = await Promise.all([
    getPropertyById(id),
    getTranslations('property'),
  ]);

  if (!property) notFound();

  const related = await getRelatedProperties(property, 3);

  const primaryImage = property.images.find((i) => i.isPrimary) ?? property.images[0];

  const listingSchema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
    url: `https://luxhomein.com/propiedades/${property.id}`,
    ...(primaryImage && { image: primaryImage.url }),
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'EUR',
      availability:
        property.status === 'disponible'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/SoldOut',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.location.address,
      addressLocality: property.location.city,
      postalCode: property.location.postalCode,
      addressRegion: property.location.province,
      addressCountry: 'ES',
    },
    floorSize: {
      '@type': 'QuantitativeValue',
      value: property.features.area,
      unitCode: 'MTK',
    },
    numberOfRooms: property.features.bedrooms,
    numberOfBathroomsTotal: property.features.bathrooms,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: t('home'),
        item: 'https://luxhomein.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: t('back').replace('← ', ''),
        item: 'https://luxhomein.com/propiedades',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: property.title,
        item: `https://luxhomein.com/propiedades/${property.id}`,
      },
    ],
  };

  const statusClasses: Record<string, string> = {
    disponible: 'bg-emerald-100 text-emerald-800',
    reservado: 'bg-amber-100 text-amber-800',
    vendido: 'bg-red-100 text-red-800',
    alquilado: 'bg-blue-100 text-blue-800',
  };

  const amenities: { key: string; label: string; icon: React.ReactNode }[] = [
    { key: 'hasGarage', label: t('garage'), icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg> },
    { key: 'hasPool', label: t('pool'), icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg> },
    { key: 'hasTerrace', label: t('terrace'), icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.125 1.125 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg> },
    { key: 'hasGarden', label: t('garden'), icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.355a7.5 7.5 0 01-3 0M12 3c-4.97 0-9 3.694-9 8.25 0 2.669 1.274 5.054 3.3 6.6" /></svg> },
    { key: 'hasElevator', label: t('elevator'), icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" /></svg> },
    { key: 'hasAirConditioning', label: t('ac'), icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21M3 12h2.25m13.5 0H21m-3.697-7.303l-1.59 1.59M6.287 17.713l-1.59 1.59m12.606 0l-1.59-1.59M6.287 6.287L4.697 4.697" /></svg> },
    { key: 'hasHeating', label: t('heating'), icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" /></svg> },
    { key: 'hasStorageRoom', label: t('storage'), icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg> },
  ];

  return (
    <div className="pt-20 bg-[var(--cream)] min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listingSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <nav className="flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-[var(--gold)] transition-colors">{t('home')}</Link>
          <span>/</span>
          <Link href="/propiedades" className="hover:text-[var(--gold)] transition-colors">{t('back').replace('← ', '')}</Link>
          <span>/</span>
          <span className="text-[var(--navy)] font-medium truncate max-w-xs">{property.title}</span>
        </nav>
      </div>

      {/* Image gallery */}
      <div className="max-w-7xl mx-auto px-6 mb-10">
        <PropertyGallery images={property.images} />
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left — Details */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusClasses[property.status]}`}>
                  {t(`status.${property.status}`)}
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full gold-gradient text-[var(--navy)] uppercase">
                  {t(`operation.${property.operation}`)}
                </span>
                {property.isNewDevelopment && (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[var(--navy)] text-[var(--gold)]">
                    {t('newDevelopment')}
                  </span>
                )}
              </div>

              <h1 className="text-[var(--navy)] font-bold text-3xl md:text-4xl leading-tight mb-2 font-playfair">
                {property.title}
              </h1>

              <p className="text-gray-500 flex items-center gap-1.5 mb-4">
                <svg className="w-4 h-4 text-[var(--gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {property.location.address}, {property.location.neighborhood && `${property.location.neighborhood}, `}
                {property.location.city}, {property.location.province}
              </p>

              <p className="text-[var(--gold)] font-bold text-3xl">
                {formatPrice(property.price, property.operation)}
              </p>
              {property.pricePerM2 && (
                <p className="text-gray-400 text-sm mt-1">
                  {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(property.pricePerM2)}{t('pricePerM2')}
                </p>
              )}
            </div>

            {/* Quick features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white rounded-xl p-5 shadow-sm mb-8">
              <FeatureStat icon="🛏️" label={t('bedroomsLabel')} value={String(property.features.bedrooms)} />
              <FeatureStat icon="🚿" label={t('bathrooms', { n: '' }).replace(' ', '')} value={String(property.features.bathrooms)} />
              <FeatureStat icon="📐" label={t('area', { n: '' }).replace(' ', '')} value={`${property.features.area} m²`} />
              {property.features.plotArea && (
                <FeatureStat icon="🌿" label={t('plotArea')} value={`${property.features.plotArea} m²`} />
              )}
              {property.features.floor !== undefined && (
                <FeatureStat icon="🏢" label={t('floor', { n: '' }).replace(' ', '')} value={String(property.features.floor)} />
              )}
              {property.features.energyCertificate && (
                <FeatureStat icon="⚡" label={t('energy')} value={property.features.energyCertificate} />
              )}
              {property.features.orientation && (
                <FeatureStat icon="🧭" label={t('orientation')} value={property.features.orientation} />
              )}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-[var(--navy)] font-bold text-xl mb-4 font-playfair">
                {t('description')}
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{property.description}</p>
            </div>

            {/* Amenities */}
            <div className="mb-8">
              <h2 className="text-[var(--navy)] font-bold text-xl mb-4 font-playfair">
                {t('features')}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {amenities.map(({ key, label, icon }) => {
                  const has = property.features[key as keyof typeof property.features] === true;
                  return (
                    <div
                      key={key}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm ${
                        has ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-400 line-through'
                      }`}
                    >
                      <span>{icon}</span>
                      <span>{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ref */}
            <div className="text-xs text-gray-400 border-t border-gray-100 pt-4 flex flex-wrap gap-4">
              <span>{t('reference')} <strong>{property.reference}</strong></span>
              <span>{t('publishedAt')}: {new Date(property.publishedAt).toLocaleDateString('es-ES')}</span>
              <span>{t('updatedAt')}: {new Date(property.updatedAt).toLocaleDateString('es-ES')}</span>
            </div>
          </div>

          {/* Right — Contact */}
          <div>
            <div className="sticky top-24">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="luxury-gradient p-6">
                  <p className="text-[var(--gold)] text-xs font-semibold tracking-widest uppercase mb-3">{t('advisor')}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center text-[var(--navy)] font-bold">
                      LH
                    </div>
                    <div>
                      <p className="text-white font-semibold">LuxHome</p>
                      <p className="text-white/60 text-xs">+34 691 294 443</p>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <a
                      href="tel:+34691294443"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/10 rounded-lg text-white text-sm hover:bg-white/20 transition-colors"
                    >
                      📞 {t('callButton')}
                    </a>
                    <a
                      href="https://wa.me/34691294443"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#25d366]/20 rounded-lg text-white text-sm hover:bg-[#25d366]/30 transition-colors"
                    >
                      💬 {t('whatsappButton')}
                    </a>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-[var(--navy)] mb-1 font-playfair">{t('contact')}</h3>
                  <p className="text-gray-400 text-sm mb-4">{t('contactSubtitle')}</p>
                  <PropertyContactForm propertyRef={property.reference} propertyTitle={property.title} />
                </div>
              </div>

              <div className="mt-4 bg-white rounded-xl shadow p-4 flex items-center justify-between">
                <p className="text-sm text-gray-500">{t('reference')} {property.reference}</p>
                <ShareButton
                  title={property.title}
                  url={`https://luxhomein.com/propiedades/${property.id}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-[var(--navy)] font-bold text-2xl mb-6 font-playfair">
              {t('related')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FeatureStat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="text-center">
      <span className="text-2xl">{icon}</span>
      <p className="text-[var(--navy)] font-bold text-lg mt-1">{value}</p>
      <p className="text-gray-400 text-xs">{label}</p>
    </div>
  );
}

