'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Property } from '@/types/property';
import { formatPrice } from '@/lib/propertyUtils';
import { Link } from '@/i18n/navigation';

export default function PropertyQuickView() {
  const [property, setProperty] = useState<Property | null>(null);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.property) {
        setProperty(customEvent.detail.property);
        setCurrentImgIndex(0);
      }
    };

    window.addEventListener('open_quick_view', handleOpen);
    return () => window.removeEventListener('open_quick_view', handleOpen);
  }, []);

  if (!property) return null;

  const images = property.images && property.images.length > 0 ? property.images : [];
  const currentImg = images[currentImgIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100 max-h-[90vh]">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setProperty(null)}
          className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-md flex items-center justify-center transition-all cursor-pointer text-lg"
        >
          ✕
        </button>

        {/* Left: Image Slider */}
        <div className="relative w-full md:w-1/2 h-64 md:h-auto bg-gray-900 shrink-0">
          {currentImg ? (
            <Image
              src={currentImg.url}
              alt={currentImg.alt || property.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/40">—</div>
          )}

          {/* Slider controls */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center shadow-md cursor-pointer text-lg"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => setCurrentImgIndex((prev) => (prev + 1) % images.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center shadow-md cursor-pointer text-lg"
              >
                ›
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                {images.map((_, i) => (
                  <span
                    key={i}
                    className={`block h-1.5 rounded-full transition-all ${
                      i === currentImgIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Operation tag */}
          <div className="absolute top-4 left-4 z-20">
            <span className="px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-white text-[var(--dark)] shadow-md">
              {property.operation}
            </span>
          </div>
        </div>

        {/* Right: Property Information */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto no-scrollbar">
          <div>
            <span className="text-xs font-semibold tracking-[0.15em] uppercase text-[var(--accent)] block mb-2">
              {property.type}
            </span>

            <span className="text-3xl md:text-4xl font-light font-playfair text-[var(--dark)] block mb-2">
              {formatPrice(property.price, property.operation)}
            </span>

            <h3 className="text-lg font-medium text-gray-900 leading-snug mb-2">{property.title}</h3>

            <p className="text-xs text-gray-500 mb-6 flex items-center gap-1">
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              {property.location.neighborhood ? `${property.location.neighborhood}, ` : ''}
              {property.location.city}
            </p>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-2xl mb-6 text-center text-xs">
              <div>
                <span className="block text-gray-400 text-[10px] uppercase font-semibold">Dormitorios</span>
                <span className="text-sm font-semibold text-gray-800">{property.features.bedrooms}</span>
              </div>
              <div>
                <span className="block text-gray-400 text-[10px] uppercase font-semibold">Baños</span>
                <span className="text-sm font-semibold text-gray-800">{property.features.bathrooms}</span>
              </div>
              <div>
                <span className="block text-gray-400 text-[10px] uppercase font-semibold">Superficie</span>
                <span className="text-sm font-semibold text-gray-800">{property.features.area} m²</span>
              </div>
            </div>

            {/* Amenities list */}
            <div className="flex flex-wrap gap-2 mb-6 text-xs">
              {property.features.hasPool && (
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg font-medium">🏊 Piscina</span>
              )}
              {property.features.hasGarage && (
                <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg font-medium">🚗 Garaje</span>
              )}
              {property.features.hasTerrace && (
                <span className="px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg font-medium">☀️ Terraza</span>
              )}
              {property.features.hasGarden && (
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg font-medium">🌳 Jardín</span>
              )}
              {property.features.hasElevator && (
                <span className="px-2.5 py-1 bg-purple-50 text-purple-800 rounded-lg font-medium">🛗 Ascensor</span>
              )}
            </div>

            <p className="text-xs text-gray-600 line-clamp-3 mb-6 font-light leading-relaxed">
              {property.description}
            </p>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
            <a
              href={`https://wa.me/34691294443?text=Hola,%20quisiera%20solicitar%20una%20visita%20para%20la%20propiedad:%20${encodeURIComponent(property.title)}%20(Ref:%20${property.reference})`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 px-4 rounded-xl bg-[#25d366] text-white text-xs font-semibold tracking-wider uppercase text-center hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              Pedir visita por WhatsApp
            </a>
            <Link
              href={`/propiedades/${property.id}`}
              onClick={() => setProperty(null)}
              className="py-3 px-5 rounded-xl bg-[var(--dark)] text-white text-xs font-semibold tracking-wider uppercase text-center hover:bg-[var(--accent)] transition-colors"
            >
              Ficha completa →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
