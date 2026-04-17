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

  const statusClasses: Record<Property['status'], string> = {
    disponible: 'bg-emerald-100 text-emerald-800',
    reservado: 'bg-amber-100 text-amber-800',
    vendido: 'bg-red-100 text-red-800',
    alquilado: 'bg-blue-100 text-blue-800',
  };

  return (
    <Link href={`/propiedades/${property.id}`} className="block group">
      <article className={`bg-white rounded-xl overflow-hidden card-hover ${featured ? 'shadow-lg' : 'shadow-md'}`}>
        {/* Image */}
        <div className={`relative overflow-hidden ${featured ? 'h-64' : 'h-52'}`}>
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm">—</span>
            </div>
          )}

          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Badges top */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusClasses[property.status]}`}>
              {t(`status.${property.status}`)}
            </span>
            {property.isNewDevelopment && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#0f1f3d] text-[#c9a84c]">
                {t('newDevelopment')}
              </span>
            )}
          </div>

          {/* Operation tag */}
          <div className="absolute top-3 right-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full gold-gradient text-[#0f1f3d] uppercase tracking-wide">
              {t(`operation.${property.operation}`)}
            </span>
          </div>

          {/* Price bottom */}
          <div className="absolute bottom-3 left-3">
            <p className="text-white font-bold text-xl drop-shadow-md">
              {formatPrice(property.price, property.operation)}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-[#c9a84c] font-medium uppercase tracking-wide">
              {t(`type.${property.type}`)}
            </span>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-400">{property.reference}</span>
          </div>

          <h3 className="font-semibold text-[#0f1f3d] text-base leading-snug line-clamp-2 mb-2 group-hover:text-[#c9a84c] transition-colors">
            {property.title}
          </h3>

          <p className="text-gray-500 text-sm mb-4 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-[#c9a84c] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
            {property.location.neighborhood ? `${property.location.neighborhood}, ` : ''}
            {property.location.city}
          </p>

          {/* Features */}
          <div className="flex items-center gap-4 text-sm text-gray-600 border-t border-gray-100 pt-3">
            <span className="flex items-center gap-1">
              <BedIcon />
              {t('bedrooms', { n: property.features.bedrooms })}
            </span>
            <span className="flex items-center gap-1">
              <BathIcon />
              {t('bathrooms', { n: property.features.bathrooms })}
            </span>
            <span className="flex items-center gap-1">
              <AreaIcon />
              {t('area', { n: property.features.area })}
            </span>
            {property.features.hasGarage && (
              <span className="flex items-center gap-1 text-[#c9a84c]">
                <GarageIcon />
                {t('garage')}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

function BedIcon() {
  return (
    <svg className="w-4 h-4 text-[#c9a84c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M2 12V8a2 2 0 012-2h16a2 2 0 012 2v4M2 12v4a2 2 0 002 2h16a2 2 0 002-2v-4" />
    </svg>
  );
}

function BathIcon() {
  return (
    <svg className="w-4 h-4 text-[#c9a84c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16M4 12V7a3 3 0 016 0M4 12v5a2 2 0 002 2h12a2 2 0 002-2v-5" />
    </svg>
  );
}

function AreaIcon() {
  return (
    <svg className="w-4 h-4 text-[#c9a84c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
    </svg>
  );
}

function GarageIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10l1.5-4.5A1 1 0 015.443 5h13.114a1 1 0 01.943.5L21 10M3 10v8a1 1 0 001 1h16a1 1 0 001-1v-8M3 10h18" />
    </svg>
  );
}
