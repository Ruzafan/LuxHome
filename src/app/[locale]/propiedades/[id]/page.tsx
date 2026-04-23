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

  const statusLabels: Record<string, string> = {
    disponible: '',
    reservado: t('status.reservado'),
    vendido: t('status.vendido'),
    alquilado: t('status.alquilado'),
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
    <div className="pt-[72px] min-h-screen" style={{ background: 'var(--bg)' }}>
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
        <nav className="flex items-center gap-2 text-[13px]" style={{ color: "var(--subtle)" }}>
          <Link href="/" className="transition-colors hover:text-[var(--dark)]">{t('home')}</Link>
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
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span
                  className="text-[10px] font-medium tracking-[0.12em] uppercase px-2 py-1"
                  style={{ border: '1px solid var(--accent)', color: 'var(--accent)' }}
                >
                  {t(`operation.${property.operation}`)}
                </span>
                {statusLabels[property.status] && (
                  <span
                    className="text-[10px] font-medium tracking-[0.1em] uppercase px-2 py-1"
                    style={{ border: '1px solid var(--subtle)', color: 'var(--mid)' }}
                  >
                    {statusLabels[property.status]}
                  </span>
                )}
                {property.isNewDevelopment && (
                  <span
                    className="text-[10px] font-medium tracking-[0.1em] uppercase px-2 py-1 text-white"
                    style={{ background: 'var(--dark)' }}
                  >
                    {t('newDevelopment')}
                  </span>
                )}
              </div>

              <h1
                className="font-light leading-tight mb-3"
                style={{
                  fontFamily: 'var(--font-cormorant), Georgia, serif',
                  fontSize: 'clamp(32px, 4vw, 52px)',
                  color: 'var(--dark)',
                  letterSpacing: '-0.01em',
                }}
              >
                {property.title}
              </h1>

              <p className="flex items-center gap-1.5 mb-4 text-[13px]" style={{ color: 'var(--subtle)' }}>
                <svg className="w-4 h-4 shrink-0" style={{ color: 'var(--accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {property.location.address}, {property.location.neighborhood && `${property.location.neighborhood}, `}
                {property.location.city}, {property.location.province}
              </p>

              <p
                className="font-light leading-none"
                style={{
                  fontFamily: 'var(--font-cormorant), Georgia, serif',
                  fontSize: '42px',
                  color: 'var(--dark)',
                }}
              >
                {formatPrice(property.price, property.operation)}
              </p>
              {property.pricePerM2 && (
                <p className="text-gray-400 text-sm mt-1">
                  {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(property.pricePerM2)}{t('pricePerM2')}
                </p>
              )}
            </div>

            {/* Quick features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-[var(--bg2)] mb-6">
              <FeatureStat
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M3 12V7a1 1 0 011-1h16a1 1 0 011 1v5M3 12v5a1 1 0 001 1h16a1 1 0 001-1v-5M8 8v4m8-4v4" /></svg>}
                label={t('bedroomsLabel')}
                value={String(property.features.bedrooms)}
              />
              <FeatureStat
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4c0 0-7.5 7.5-7.5 11.25a7.5 7.5 0 0015 0C19.5 11.5 12 4 12 4z" /></svg>}
                label={t('bathrooms', { n: '' }).replace(' ', '')}
                value={String(property.features.bathrooms)}
              />
              <FeatureStat
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>}
                label={t('area', { n: '' }).replace(' ', '')}
                value={`${property.features.area} m²`}
              />
              {property.features.plotArea && (
                <FeatureStat
                  icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" /></svg>}
                  label={t('plotArea')}
                  value={`${property.features.plotArea} m²`}
                />
              )}
              {property.features.floor !== undefined && (
                <FeatureStat
                  icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21" /></svg>}
                  label={t('floor', { n: '' }).replace(' ', '')}
                  value={String(property.features.floor)}
                />
              )}
              {property.features.energyCertificate && (
                <FeatureStat
                  icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>}
                  label={t('energy')}
                  value={property.features.energyCertificate}
                />
              )}
              {property.features.orientation && (
                <FeatureStat
                  icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>}
                  label={t('orientation')}
                  value={property.features.orientation}
                />
              )}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="font-light text-2xl mb-4" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', color: 'var(--dark)' }}>
                {t('description')}
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{property.description}</p>
            </div>

            {/* Amenities */}
            <div className="mb-8">
              <h2 className="font-light text-2xl mb-4" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', color: 'var(--dark)' }}>
                {t('features')}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {amenities.map(({ key, label, icon }) => {
                  const has = property.features[key as keyof typeof property.features] === true;
                  return (
                    <div
                      key={key}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm"
                      style={has
                        ? { background: 'var(--bg2)', color: 'var(--dark)' }
                        : { background: 'var(--bg)', color: 'var(--subtle)', textDecoration: 'line-through' }
                      }
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
              <div className="bg-white overflow-hidden" style={{ border: '1px solid var(--bg2)' }}>
                <div className="p-6" style={{ background: 'var(--dark)' }}>
                  <p className="text-[11px] font-medium tracking-[0.16em] uppercase mb-3" style={{ color: 'oklch(100% 0 0 / 0.4)' }}>{t('advisor')}</p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 flex items-center justify-center text-white font-medium"
                      style={{ background: 'var(--accent)', fontFamily: 'var(--font-cormorant)', fontSize: '16px' }}
                    >
                      LH
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">LuxHome</p>
                      <p className="text-[12px]" style={{ color: 'oklch(100% 0 0 / 0.5)' }}>+34 691 294 443</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <a
                      href="tel:+34691294443"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 text-white text-xs font-medium tracking-wide transition-colors"
                      style={{ background: 'oklch(100% 0 0 / 0.1)' }}
                    >
                      📞 {t('callButton')}
                    </a>
                    <a
                      href="https://wa.me/34691294443"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 text-white text-xs font-medium tracking-wide transition-colors"
                      style={{ background: 'oklch(100% 0 0 / 0.1)' }}
                    >
                      💬 {t('whatsappButton')}
                    </a>
                  </div>
                </div>

                <div className="p-6">
                  <h3
                    className="font-light text-xl mb-1"
                    style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', color: 'var(--dark)' }}
                  >{t('contact')}</h3>
                  <p className="text-[13px] mb-4" style={{ color: 'var(--subtle)' }}>{t('contactSubtitle')}</p>
                  <PropertyContactForm propertyRef={property.reference} propertyTitle={property.title} />
                </div>
              </div>

              <div className="mt-[2px] bg-white p-4 flex items-center justify-between" style={{ border: '1px solid var(--bg2)' }}>
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
            <h2 className="font-light text-3xl mb-6" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', color: 'var(--dark)' }}>
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

function FeatureStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-3 bg-[var(--bg)]">
      <span style={{ color: 'var(--accent)' }}>{icon}</span>
      <div>
        <p className="text-[13px] font-medium leading-tight" style={{ color: 'var(--dark)' }}>{value}</p>
        <p className="text-[11px] leading-tight" style={{ color: 'var(--subtle)' }}>{label}</p>
      </div>
    </div>
  );
}

