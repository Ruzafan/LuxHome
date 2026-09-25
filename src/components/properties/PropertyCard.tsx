'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Property } from '@/types/property';
import { formatPrice } from '@/lib/propertyUtils';
import {
  ArrowsLeftRight, Bathtub, Bed, Car, CaretLeft, CaretRight, Check, Eye, Heart,
  HouseLine, MapPin, Ruler, SunHorizon, SwimmingPool,
} from '@phosphor-icons/react';

interface Props {
  property: Property;
  /** "large" stretches the image to fill a taller bento cell */
  size?: 'default' | 'large';
}

export default function PropertyCard({ property, size = 'default' }: Props) {
  const t = useTranslations('property');

  const images = property.images && property.images.length > 0
    ? property.images
    : [];

  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCompared, setIsCompared] = useState(false);

  useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem('luxhome_favs') || '[]');
      if (Array.isArray(favs) && favs.includes(property.id)) {
        setIsFavorite(true);
      }
      const compareList: Property[] = JSON.parse(localStorage.getItem('luxhome_compare_items') || '[]');
      if (Array.isArray(compareList) && compareList.some((p) => p.id === property.id)) {
        setIsCompared(true);
      }
    } catch {}
  }, [property.id]);

  useEffect(() => {
    const checkCompare = () => {
      try {
        const compareList: Property[] = JSON.parse(localStorage.getItem('luxhome_compare_items') || '[]');
        setIsCompared(Array.isArray(compareList) && compareList.some((p) => p.id === property.id));
      } catch {}
    };
    window.addEventListener('luxhome_compare_change', checkCompare);
    return () => window.removeEventListener('luxhome_compare_change', checkCompare);
  }, [property.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const favs: string[] = JSON.parse(localStorage.getItem('luxhome_favs') || '[]');
      const newFavs = favs.includes(property.id)
        ? favs.filter((id) => id !== property.id)
        : [...favs, property.id];
      localStorage.setItem('luxhome_favs', JSON.stringify(newFavs));
      setIsFavorite(newFavs.includes(property.id));
    } catch {}
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.dispatchEvent(
      new CustomEvent('open_quick_view', { detail: { property } })
    );
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const items: Property[] = JSON.parse(
        localStorage.getItem('luxhome_compare_items') || '[]'
      );
      const exists = items.some((p) => p.id === property.id);
      let updated: Property[];
      if (exists) {
        updated = items.filter((p) => p.id !== property.id);
      } else {
        if (items.length >= 4) return;
        updated = [...items, property];
      }
      localStorage.setItem('luxhome_compare_items', JSON.stringify(updated));
      window.dispatchEvent(new Event('luxhome_compare_change'));
    } catch {}
  };

  const handleNextImg = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImg = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const currentImg = images[currentImgIndex];
  const large = size === 'large';

  return (
    <div
      className="card-hover group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-white p-2"
      style={{ boxShadow: 'inset 0 0 0 1px var(--line)' }}
    >
      {/* Image, inset inside the card with a nested radius */}
      <div
        className={`relative w-full shrink-0 overflow-hidden rounded-[18px] ${
          large ? 'aspect-[4/3] lg:aspect-auto lg:min-h-[320px] lg:flex-1' : 'aspect-[4/3]'
        }`}
      >
        <Link href={`/propiedades/${property.id}`} className="relative block h-full w-full">
          {currentImg ? (
            <Image
              src={currentImg.url}
              alt={currentImg.alt || property.title}
              fill
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
              sizes={large ? '(max-width: 1024px) 100vw, 55vw' : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw'}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--bg2)] text-[var(--subtle)]">
              <HouseLine size={36} weight="thin" />
            </div>
          )}
        </Link>

        {/* Actions: favorite, quick view, compare */}
        <div className="absolute right-3 top-3 z-20 flex items-center gap-0.5 rounded-full bg-white/85 p-1 shadow-sm backdrop-blur-md">
          <button
            type="button"
            onClick={toggleFavorite}
            aria-label="Añadir a favoritos"
            aria-pressed={isFavorite}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-[var(--rose-soft)] active:scale-95"
            style={{ color: isFavorite ? 'var(--accent)' : 'var(--dark)' }}
          >
            <Heart size={17} weight={isFavorite ? 'fill' : 'regular'} />
          </button>
          <button
            type="button"
            onClick={handleQuickView}
            aria-label="Vista rápida"
            title="Vista rápida"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[var(--dark)] transition-colors hover:bg-[var(--rose-soft)] active:scale-95"
          >
            <Eye size={17} />
          </button>
          <button
            type="button"
            onClick={handleCompare}
            aria-label="Añadir a comparativa"
            aria-pressed={isCompared}
            title="Añadir a comparativa"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-[var(--rose-soft)] active:scale-95"
            style={isCompared ? { background: 'var(--dark)', color: 'white' } : { color: 'var(--dark)' }}
          >
            {isCompared ? <Check size={16} weight="bold" /> : <ArrowsLeftRight size={16} />}
          </button>
        </div>

        {/* Prev / Next photo arrows on hover */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevImg}
              className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/85 text-[var(--dark)] opacity-0 shadow-sm backdrop-blur-md transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              aria-label="Foto anterior"
            >
              <CaretLeft size={16} />
            </button>
            <button
              type="button"
              onClick={handleNextImg}
              className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/85 text-[var(--dark)] opacity-0 shadow-sm backdrop-blur-md transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              aria-label="Foto siguiente"
            >
              <CaretRight size={16} />
            </button>
            <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1">
              {images.slice(0, 5).map((_, idx) => (
                <span
                  key={idx}
                  className={`block h-1.5 rounded-full transition-all ${
                    idx === currentImgIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Card content */}
      <div className={`flex flex-1 flex-col justify-between px-3 pb-3 pt-4 ${large ? 'lg:flex-none lg:px-4 lg:pt-5' : ''}`}>
        <div>
          <p className="mb-2 text-[12px]" style={{ color: 'var(--accent)' }}>
            {t(`type.${property.type}`)} · {t(`operation.${property.operation}`)}
          </p>

          <Link href={`/propiedades/${property.id}`} className="group/title block">
            <span
              className="font-display mb-1.5 block font-normal leading-none"
              style={{ fontSize: large ? 'clamp(30px, 3vw, 38px)' : '28px', color: 'var(--dark)' }}
            >
              {formatPrice(property.price, property.operation)}
            </span>
            <h3 className="mb-1.5 line-clamp-2 text-[15px] font-normal leading-snug text-[var(--dark)] transition-colors group-hover/title:text-[var(--accent)]">
              {property.title}
            </h3>
          </Link>

          <p className="mb-4 flex items-center gap-1 text-[13px]" style={{ color: 'var(--subtle)' }}>
            <MapPin size={14} className="shrink-0" />
            {property.location.neighborhood ? `${property.location.neighborhood}, ` : ''}
            {property.location.city}
          </p>
        </div>

        {/* Specs */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]" style={{ color: 'var(--mid)' }}>
          {property.features.bedrooms > 0 && (
            <span className="flex items-center gap-1.5">
              <Bed size={17} weight="light" />
              {t('bedrooms', { n: property.features.bedrooms })}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Bathtub size={17} weight="light" />
            {t('bathrooms', { n: property.features.bathrooms })}
          </span>
          <span className="flex items-center gap-1.5">
            <Ruler size={17} weight="light" />
            {t('area', { n: property.features.area })}
          </span>
          {property.features.hasPool && (
            <span className="flex items-center" title={t('pool')}>
              <SwimmingPool size={17} weight="light" aria-hidden />
              <span className="sr-only">{t('pool')}</span>
            </span>
          )}
          {property.features.hasTerrace && (
            <span className="flex items-center" title={t('terrace')}>
              <SunHorizon size={17} weight="light" aria-hidden />
              <span className="sr-only">{t('terrace')}</span>
            </span>
          )}
          {property.features.hasGarage && (
            <span className="flex items-center" title={t('garage')}>
              <Car size={17} weight="light" aria-hidden />
              <span className="sr-only">{t('garage')}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
