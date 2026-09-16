'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Property } from '@/types/property';
import { formatPrice } from '@/lib/propertyUtils';
import { Link } from '@/i18n/navigation';

export default function CompareDrawer() {
  const [compareList, setCompareList] = useState<Property[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const updateCompareList = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('luxhome_compare_items') || '[]');
        if (Array.isArray(stored)) {
          setCompareList(stored);
        }
      } catch {}
    };

    updateCompareList();
    window.addEventListener('luxhome_compare_change', updateCompareList);
    return () => window.removeEventListener('luxhome_compare_change', updateCompareList);
  }, []);

  if (compareList.length === 0) return null;

  const removeFromCompare = (id: string) => {
    const updated = compareList.filter((p) => p.id !== id);
    setCompareList(updated);
    localStorage.setItem('luxhome_compare_items', JSON.stringify(updated));
    window.dispatchEvent(new Event('luxhome_compare_change'));
  };

  const clearAll = () => {
    setCompareList([]);
    localStorage.removeItem('luxhome_compare_items');
    window.dispatchEvent(new Event('luxhome_compare_change'));
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Bottom Bar */}
      <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[var(--dark)] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10 backdrop-blur-xl animate-fade-in max-w-[95vw] md:max-w-2xl">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
            Comparador ({compareList.length}/4)
          </span>
        </div>

        {/* Thumbnails */}
        <div className="hidden sm:flex items-center gap-2 overflow-x-auto">
          {compareList.map((p) => {
            const img = p.images?.[0]?.url;
            return (
              <div key={p.id} className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-white/20 group">
                {img ? (
                  <Image src={img} alt={p.title} fill className="object-cover" sizes="36px" />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center text-[10px]">—</div>
                )}
                <button
                  type="button"
                  onClick={() => removeFromCompare(p.id)}
                  className="absolute inset-0 bg-black/60 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Eliminar"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--rose-dark)] text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-md cursor-pointer whitespace-nowrap"
          >
            Ver comparativa
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="p-2 text-gray-400 hover:text-white transition-colors cursor-pointer text-xs"
            title="Limpiar todo"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Full Modal Comparison Matrix */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-100">
            {/* Header */}
            <div className="p-6 bg-[var(--dark)] text-white flex items-center justify-between shrink-0">
              <div>
                <span className="text-xs font-semibold tracking-[0.2em] text-[var(--gold)] uppercase block mb-1">
                  Herramienta de decisión
                </span>
                <h2 className="text-2xl font-light font-playfair">Comparativa de Inmuebles</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer text-lg"
              >
                ✕
              </button>
            </div>

            {/* Matrix Content */}
            <div className="p-6 overflow-x-auto flex-1 no-scrollbar">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="p-3 w-40 text-xs uppercase font-semibold text-gray-400">Características</th>
                    {compareList.map((p) => {
                      const img = p.images?.[0]?.url;
                      return (
                        <th key={p.id} className="p-3 min-w-[200px] align-top">
                          <div className="relative h-32 rounded-xl overflow-hidden mb-3 bg-gray-100">
                            {img && <Image src={img} alt={p.title} fill className="object-cover" sizes="200px" />}
                          </div>
                          <span className="block text-xs font-semibold text-[var(--accent)] uppercase tracking-wide mb-1">
                            {p.type}
                          </span>
                          <h4 className="text-sm font-semibold text-gray-900 line-clamp-1 mb-1">{p.title}</h4>
                          <span className="text-lg font-light text-[var(--dark)] block font-playfair font-bold">
                            {formatPrice(p.price, p.operation)}
                          </span>
                          <Link
                            href={`/propiedades/${p.id}`}
                            onClick={() => setIsOpen(false)}
                            className="inline-block mt-2 text-xs font-semibold text-[var(--accent)] hover:underline"
                          >
                            Ver detalle →
                          </Link>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  <tr>
                    <td className="p-3 font-medium text-gray-500 text-xs uppercase">Precio / m²</td>
                    {compareList.map((p) => (
                      <td key={p.id} className="p-3 font-semibold text-gray-800">
                        {p.pricePerM2 ? `${p.pricePerM2} €/m²` : `${Math.round(p.price / (p.features.area || 1))} €/m²`}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-gray-500 text-xs uppercase">Ubicación</td>
                    {compareList.map((p) => (
                      <td key={p.id} className="p-3 text-gray-700">
                        {p.location.city} {p.location.neighborhood ? `(${p.location.neighborhood})` : ''}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-gray-500 text-xs uppercase">Superficie</td>
                    {compareList.map((p) => (
                      <td key={p.id} className="p-3 text-gray-700 font-medium">
                        {p.features.area} m²
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-gray-500 text-xs uppercase">Habitaciones</td>
                    {compareList.map((p) => (
                      <td key={p.id} className="p-3 text-gray-700">
                        {p.features.bedrooms} hab.
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-gray-500 text-xs uppercase">Baños</td>
                    {compareList.map((p) => (
                      <td key={p.id} className="p-3 text-gray-700">
                        {p.features.bathrooms} baños
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-gray-500 text-xs uppercase">Piscina</td>
                    {compareList.map((p) => (
                      <td key={p.id} className="p-3">
                        {p.features.hasPool ? <span className="text-emerald-600 font-semibold">✓ Sí</span> : <span className="text-gray-300">✕ No</span>}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-gray-500 text-xs uppercase">Garaje</td>
                    {compareList.map((p) => (
                      <td key={p.id} className="p-3">
                        {p.features.hasGarage ? <span className="text-emerald-600 font-semibold">✓ Sí</span> : <span className="text-gray-300">✕ No</span>}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-gray-500 text-xs uppercase">Terraza</td>
                    {compareList.map((p) => (
                      <td key={p.id} className="p-3">
                        {p.features.hasTerrace ? <span className="text-emerald-600 font-semibold">✓ Sí</span> : <span className="text-gray-300">✕ No</span>}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>Comparando {compareList.length} de 4 propiedades permitidas.</span>
              <button
                type="button"
                onClick={clearAll}
                className="text-rose-600 font-semibold hover:underline cursor-pointer"
              >
                Limpiar lista de comparación
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
