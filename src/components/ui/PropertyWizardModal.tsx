'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';

export default function PropertyWizardModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [operacion, setOperacion] = useState('venta');
  const [ciudad, setCiudad] = useState('');
  const [feature, setFeature] = useState('');
  const [locations, setLocations] = useState<string[]>([]);
  const [searchLocation, setSearchLocation] = useState('');
  const [loadingLocations, setLoadingLocations] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleOpen = () => {
      setStep(1);
      setIsOpen(true);
      if (locations.length === 0) {
        fetchLocations();
      }
    };

    window.addEventListener('open_property_wizard', handleOpen);
    return () => window.removeEventListener('open_property_wizard', handleOpen);
  }, [locations.length]);

  const fetchLocations = async () => {
    setLoadingLocations(true);
    try {
      const res = await fetch('/api/locations');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.locations) && data.locations.length > 0) {
          setLocations(data.locations);
        }
      }
    } catch (err) {
      console.error('Error fetching locations:', err);
    } finally {
      setLoadingLocations(false);
    }
  };

  if (!isOpen) return null;

  const handleFinish = () => {
    const params = new URLSearchParams();
    if (operacion) params.set('operacion', operacion);
    if (ciudad) params.set('ciudad', ciudad);
    if (feature === 'piscina') params.set('piscina', '1');
    if (feature === 'terraza') params.set('terraza', '1');
    if (feature === 'garaje') params.set('garaje', '1');

    setIsOpen(false);
    router.push(`/propiedades?${params.toString()}`);
  };

  const filteredLocations = locations.filter((loc) =>
    loc.toLowerCase().includes(searchLocation.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-100 max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-[var(--dark)] text-white flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold tracking-[0.2em] text-[var(--gold)] uppercase block mb-1">
              Asistente de Búsqueda ({step}/3)
            </span>
            <h2 className="text-2xl font-light font-playfair">Encuentra tu hogar ideal</h2>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer text-lg"
          >
            ✕
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-100 h-1.5">
          <div
            className="bg-[var(--accent)] h-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Step content */}
        <div className="p-6 md:p-8 min-h-[280px] flex flex-col justify-between overflow-y-auto no-scrollbar">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">1. ¿Qué tipo de operación buscas?</h3>
              <p className="text-xs text-gray-500">Selecciona si estás interesado en comprar una vivienda o en alquilar.</p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                {[
                  { value: 'venta', title: 'Comprar una vivienda', desc: 'Casas, pisos y chalets en propiedad' },
                  { value: 'alquiler', title: 'Alquilar una vivienda', desc: 'Opciones residenciales de alquiler' },
                ].map((op) => (
                  <button
                    key={op.value}
                    type="button"
                    onClick={() => setOperacion(op.value)}
                    className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                      operacion === op.value
                        ? 'border-[var(--accent)] bg-rose-50/50 shadow-md ring-2 ring-[var(--accent)]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="block font-semibold text-sm text-gray-900 mb-1">{op.title}</span>
                    <span className="text-xs text-gray-500 font-light">{op.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">2. ¿En qué localidad quieres encontrar tu casa?</h3>
              <p className="text-xs text-gray-500">Selecciona entre las ubicaciones con propiedades disponibles.</p>

              {/* Search input for locations if list is long */}
              {locations.length > 6 && (
                <input
                  type="text"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  placeholder="Buscar localidad o barrio..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              )}

              {loadingLocations ? (
                <div className="py-8 text-center text-xs text-gray-400">Cargando ubicaciones de la base de datos...</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1 no-scrollbar pt-1">
                  <button
                    type="button"
                    onClick={() => setCiudad('')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer text-xs font-semibold ${
                      ciudad === ''
                        ? 'border-[var(--accent)] bg-[var(--dark)] text-white shadow-md'
                        : 'border-gray-200 text-gray-700 hover:border-[var(--accent)]'
                    }`}
                  >
                    Todas las zonas
                  </button>

                  {filteredLocations.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCiudad(c)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer text-xs font-semibold truncate ${
                        ciudad === c
                          ? 'border-[var(--accent)] bg-[var(--dark)] text-white shadow-md'
                          : 'border-gray-200 text-gray-700 hover:border-[var(--accent)]'
                      }`}
                      title={c}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">3. ¿Qué característica es imprescindible para ti?</h3>
              <p className="text-xs text-gray-500">Añade un filtro especial para afinar la búsqueda.</p>
              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  { value: 'piscina', label: '🏊 Piscina' },
                  { value: 'terraza', label: '☀️ Terraza' },
                  { value: 'garaje', label: '🚗 Garaje' },
                ].map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setFeature(feature === f.value ? '' : f.value)}
                    className={`p-4 rounded-xl border text-center transition-all cursor-pointer text-xs font-semibold ${
                      feature === f.value
                        ? 'border-[var(--accent)] bg-rose-50 text-[var(--accent)] shadow-md ring-2 ring-[var(--accent)]'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-6">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-900 cursor-pointer"
              >
                ← Anterior
              </button>
            ) : <div />}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="px-6 py-2.5 rounded-xl bg-[var(--dark)] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[var(--accent)] transition-colors cursor-pointer"
              >
                Siguiente →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="px-6 py-2.5 rounded-xl bg-[var(--accent)] text-white text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer shadow-md"
              >
                Ver propiedades recomendadas 🎯
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
