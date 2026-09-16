'use client';

import { useState, useEffect } from 'react';
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

  return (
    <div className="relative group bg-white card-hover overflow-hidden rounded-2xl border border-gray-100 flex flex-col h-full">
      {/* Image container */}
      <div className="relative overflow-hidden w-full shrink-0" style={{ height: featured ? '16rem' : '14rem' }}>
        <Link href={`/propiedades/${property.id}`} className="block w-full h-full">
          {currentImg ? (
            <Image
              src={currentImg.url}
              alt={currentImg.alt || property.title}
              fill
              className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
              <span className="text-sm">—</span>
            </div>
          )}
        </Link>

        {/* Operation badge — top right */}
        <div className="absolute top-3 right-3 z-10 pointer-events-none">
          <span
            className="text-[11px] font-semibold tracking-[0.1em] uppercase px-2.5 py-1 rounded-md shadow-sm"
            style={{ border: '1px solid var(--accent)', color: 'var(--accent)', background: 'rgba(255,255,255,0.95)' }}
          >
            {t(`operation.${property.operation}`)}
          </span>
        </div>

        {/* Top left actions: Favorite + QuickView + Compare */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleFavorite}
            aria-label="Añadir a favoritos"
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer text-gray-700"
          >
            <svg
              className={`w-4 h-4 transition-colors ${isFavorite ? 'text-rose-500 fill-rose-500' : 'text-gray-600 fill-none'}`}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={handleQuickView}
            aria-label="Vista rápida"
            title="Vista rápida"
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer text-gray-700"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.573 16.49 16.638 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={handleCompare}
            title="Añadir a comparativa"
            className={`px-2 py-1 rounded-md text-[10px] font-semibold tracking-wider uppercase shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1 ${
              isCompared
                ? 'bg-[var(--dark)] text-white'
                : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white'
            }`}
          >
            <span>{isCompared ? '✓' : '+'}</span> Comparar
          </button>
        </div>

        {/* Prev / Next photo arrows on hover */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevImg}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md cursor-pointer"
              aria-label="Foto anterior"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={handleNextImg}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md cursor-pointer"
              aria-label="Foto siguiente"
            >
              ›
            </button>
            {/* Dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1 pointer-events-none">
              {images.slice(0, 5).map((_, idx) => (
                <span
                  key={idx}
                  className={`block rounded-full transition-all ${
                    idx === currentImgIndex ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold tracking-[0.12em] uppercase" style={{ color: 'var(--accent)' }}>
              {t(`type.${property.type}`)}
            </span>
            {/* Feature badges (piscina, garaje, terraza) */}
            <div className="flex gap-1.5 text-gray-500">
              {property.features.hasPool && (
                <span title="Con piscina" className="p-1 rounded bg-blue-50 text-blue-600 text-[10px] font-semibold">🏊 Pool</span>
              )}
              {property.features.hasGarage && (
                <span title="Con garaje" className="p-1 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">🚗 Garaje</span>
              )}
              {property.features.hasTerrace && (
                <span title="Con terraza" className="p-1 rounded bg-amber-50 text-amber-700 text-[10px] font-semibold">☀️ Terraza</span>
              )}
            </div>
          </div>

          <Link href={`/propiedades/${property.id}`} className="block group/title">
            <span
              className="block font-light leading-none mb-2"
              style={{
                fontFamily: 'var(--font-cormorant), Georgia, serif',
                fontSize: '28px',
                color: 'var(--dark)',
              }}
            >
              {formatPrice(property.price, property.operation)}
            </span>

            <h3 className="text-sm font-medium leading-snug line-clamp-2 mb-1.5 group-hover/title:text-[var(--accent)] transition-colors text-gray-900">
              {property.title}
            </h3>
          </Link>

          <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            {property.location.neighborhood ? `${property.location.neighborhood}, ` : ''}
            {property.location.city}
          </p>
        </div>

        {/* Specs footer */}
        <div className="flex gap-4 pt-3.5 text-xs font-medium tracking-wide uppercase border-t border-gray-100 text-gray-600">
          {property.features.bedrooms > 0 && (
            <span className="flex items-center gap-1.5">
              <BedIcon />
              {t('bedrooms', { n: property.features.bedrooms })}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <BathIcon />
            {t('bathrooms', { n: property.features.bathrooms })}
          </span>
          <span className="flex items-center gap-1.5">
            <AreaIcon />
            {t('area', { n: property.features.area })}
          </span>
        </div>
      </div>
    </div>
  );
}

function BedIcon() {
  return (
    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M2 12V8a2 2 0 012-2h16a2 2 0 012 2v4M2 12v4a2 2 0 002 2h16a2 2 0 002-2v-4" />
    </svg>
  );
}

function BathIcon() {
  return (
    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16M4 12V7a3 3 0 016 0M4 12v5a2 2 0 002 2h12a2 2 0 002-2v-5" />
    </svg>
  );
}

function AreaIcon() {
  return (
    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
    </svg>
  );
}
