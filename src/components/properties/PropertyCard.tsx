'use client';

import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Property } from '@/types/property';
import { formatPrice } from '@/lib/propertyUtils';

interface Props {
  property: Property;
  featured?: boolean;
}

export default function PropertyCard({ property, featured = false }: Props) {
  const t = useTranslations('property');

  const primaryImage = property.images.find((i) => i.isPrimary) ?? property.images[0];

  return (
    <Link href={`/propiedades/${property.id}`} className="block group bg-white card-hover overflow-hidden">
      {/* Image */}
      <div className="relative overflow-hidden w-full" style={{ height: featured ? '16rem' : '13rem' }}>
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt}
            fill
            className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--bg2)' }}>
            <span className="text-sm" style={{ color: 'var(--subtle)' }}>—</span>
          </div>
        )}

        {/* Operation badge — top right */}
        <div className="absolute top-3 right-3">
          <span
            className="text-[10px] font-medium tracking-[0.12em] uppercase px-2 py-1"
            style={{ border: '1px solid var(--accent)', color: 'var(--accent)', background: 'white' }}
          >
            {t(`operation.${property.operation}`)}
          </span>
        </div>

        {/* Status badge — top left (only if not disponible) */}
        {property.status !== 'disponible' && (
          <div className="absolute top-3 left-3">
            <span
              className="text-[10px] font-medium tracking-[0.1em] uppercase px-2 py-1 bg-white"
              style={{ color: 'var(--dark)' }}
            >
              {t(`status.${property.status}`)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 pb-6">
        <span
          className="block text-[10px] font-medium tracking-[0.12em] uppercase mb-3"
          style={{ color: 'var(--accent)' }}
        >
          {t(`type.${property.type}`)}
        </span>

        <span
          className="block font-light leading-none mb-1"
          style={{
            fontFamily: 'var(--font-cormorant), Georgia, serif',
            fontSize: '26px',
            color: 'var(--dark)',
          }}
        >
          {formatPrice(property.price, property.operation)}
        </span>

        <h3
          className="text-[13px] font-normal leading-snug line-clamp-2 mb-1.5 transition-colors"
          style={{ color: 'var(--dark)' }}
        >
          {property.title}
        </h3>

        <p className="text-[12px] mb-3.5" style={{ color: 'var(--subtle)' }}>
          {property.location.neighborhood ? `${property.location.neighborhood}, ` : ''}
          {property.location.city}
        </p>

        {/* Specs */}
        <div
          className="flex gap-4 pt-3.5 text-[11px] font-medium tracking-[0.06em] uppercase"
          style={{ borderTop: '1px solid var(--bg2)', color: 'var(--mid)' }}
        >
          {property.features.bedrooms > 0 && (
            <span className="flex items-center gap-1">
              <BedIcon />
              {t('bedrooms', { n: property.features.bedrooms })}
            </span>
          )}
          <span className="flex items-center gap-1">
            <BathIcon />
            {t('bathrooms', { n: property.features.bathrooms })}
          </span>
          <span className="flex items-center gap-1">
            <AreaIcon />
            {t('area', { n: property.features.area })}
          </span>
        </div>
      </div>
    </Link>
  );
}

function BedIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M2 12V8a2 2 0 012-2h16a2 2 0 012 2v4M2 12v4a2 2 0 002 2h16a2 2 0 002-2v-4" />
    </svg>
  );
}

function BathIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16M4 12V7a3 3 0 016 0M4 12v5a2 2 0 002 2h12a2 2 0 002-2v-5" />
    </svg>
  );
}

function AreaIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
    </svg>
  );
}
