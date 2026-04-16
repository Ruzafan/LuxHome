import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getPropertyById, getRelatedProperties, formatPrice } from '@/lib/propertyService';
import PropertyCard from '@/components/properties/PropertyCard';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const property = await getPropertyById(id);
  if (!property) return { title: 'Propiedad no encontrada' };
  return {
    title: property.title,
    description: property.description.slice(0, 160),
  };
}

export default async function PropertyDetailPage({ params }: Props) {
  const { id } = await params;
  const property = await getPropertyById(id);
  if (!property) notFound();

  const related = await getRelatedProperties(property, 3);
  const primaryImage = property.images.find((i) => i.isPrimary) ?? property.images[0];
  const secondaryImages = property.images.filter((i) => !i.isPrimary);

  const statusConfig = {
    disponible: { label: 'Disponible', classes: 'bg-emerald-100 text-emerald-800' },
    reservado: { label: 'Reservado', classes: 'bg-amber-100 text-amber-800' },
    vendido: { label: 'Vendido', classes: 'bg-red-100 text-red-800' },
    alquilado: { label: 'Alquilado', classes: 'bg-blue-100 text-blue-800' },
  };
  const status = statusConfig[property.status];

  return (
    <div className="pt-20 bg-[#faf8f3] min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <nav className="flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-[#c9a84c] transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/propiedades" className="hover:text-[#c9a84c] transition-colors">Propiedades</Link>
          <span>/</span>
          <span className="text-[#0f1f3d] font-medium truncate max-w-xs">{property.title}</span>
        </nav>
      </div>

      {/* Image gallery */}
      <div className="max-w-7xl mx-auto px-6 mb-10">
        <div className="grid grid-cols-4 gap-3 rounded-2xl overflow-hidden h-96 md:h-[500px]">
          {/* Main image */}
          <div className="col-span-4 md:col-span-3 relative">
            {primaryImage && (
              <Image
                src={primaryImage.url}
                alt={primaryImage.alt}
                fill
                className="object-cover"
                priority
              />
            )}
          </div>
          {/* Secondary images */}
          <div className="hidden md:flex flex-col gap-3">
            {secondaryImages.slice(0, 2).map((img) => (
              <div key={img.id} className="relative flex-1">
                <Image src={img.url} alt={img.alt} fill className="object-cover" />
              </div>
            ))}
            {secondaryImages.length > 2 && (
              <div className="relative flex-1">
                <Image src={secondaryImages[2].url} alt={secondaryImages[2].alt} fill className="object-cover" />
                {secondaryImages.length > 3 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">+{secondaryImages.length - 3} fotos</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left — Details */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${status.classes}`}>
                  {status.label}
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full gold-gradient text-[#0f1f3d] uppercase">
                  {property.operation}
                </span>
                {property.isNewDevelopment && (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#0f1f3d] text-[#c9a84c]">
                    Obra nueva
                  </span>
                )}
              </div>

              <h1
                className="text-[#0f1f3d] font-bold text-3xl md:text-4xl leading-tight mb-2"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {property.title}
              </h1>

              <p className="text-gray-500 flex items-center gap-1.5 mb-4">
                <svg className="w-4 h-4 text-[#c9a84c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {property.location.address}, {property.location.neighborhood && `${property.location.neighborhood}, `}
                {property.location.city}, {property.location.province}
              </p>

              <p className="text-[#c9a84c] font-bold text-3xl">
                {formatPrice(property.price, property.operation)}
              </p>
              {property.pricePerM2 && (
                <p className="text-gray-400 text-sm mt-1">
                  {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(property.pricePerM2)}/m²
                </p>
              )}
            </div>

            {/* Quick features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white rounded-xl p-5 shadow-sm mb-8">
              <FeatureStat icon="🛏️" label="Habitaciones" value={String(property.features.bedrooms)} />
              <FeatureStat icon="🚿" label="Baños" value={String(property.features.bathrooms)} />
              <FeatureStat icon="📐" label="Superficie" value={`${property.features.area} m²`} />
              {property.features.plotArea && (
                <FeatureStat icon="🌿" label="Parcela" value={`${property.features.plotArea} m²`} />
              )}
              {property.features.floor !== undefined && (
                <FeatureStat icon="🏢" label="Planta" value={String(property.features.floor)} />
              )}
              {property.features.energyCertificate && (
                <FeatureStat icon="⚡" label="Certificado" value={property.features.energyCertificate} />
              )}
              {property.features.orientation && (
                <FeatureStat icon="🧭" label="Orientación" value={property.features.orientation} />
              )}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-[#0f1f3d] font-bold text-xl mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
                Descripción
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{property.description}</p>
            </div>

            {/* Amenities */}
            <div className="mb-8">
              <h2 className="text-[#0f1f3d] font-bold text-xl mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
                Características
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { key: 'hasGarage', label: 'Garaje', icon: '🚗' },
                  { key: 'hasPool', label: 'Piscina', icon: '🏊' },
                  { key: 'hasTerrace', label: 'Terraza', icon: '🌅' },
                  { key: 'hasGarden', label: 'Jardín', icon: '🌳' },
                  { key: 'hasElevator', label: 'Ascensor', icon: '🛗' },
                  { key: 'hasAirConditioning', label: 'Aire acondicionado', icon: '❄️' },
                  { key: 'hasHeating', label: 'Calefacción', icon: '🔥' },
                  { key: 'hasStorageRoom', label: 'Trastero', icon: '📦' },
                ].map(({ key, label, icon }) => {
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

            {/* Ref & dates */}
            <div className="text-xs text-gray-400 border-t border-gray-100 pt-4 flex flex-wrap gap-4">
              <span>Ref: <strong>{property.reference}</strong></span>
              <span>Publicado: {new Date(property.publishedAt).toLocaleDateString('es-ES')}</span>
              <span>Actualizado: {new Date(property.updatedAt).toLocaleDateString('es-ES')}</span>
            </div>
          </div>

          {/* Right — Contact */}
          <div>
            <div className="sticky top-24">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Agent */}
                <div className="luxury-gradient p-6">
                  <p className="text-[#c9a84c] text-xs font-semibold tracking-widest uppercase mb-3">Tu asesor</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center text-[#0f1f3d] font-bold">
                      AM
                    </div>
                    <div>
                      <p className="text-white font-semibold">Ana Martínez</p>
                      <p className="text-white/60 text-xs">Asesora · LuxHome</p>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <a
                      href="tel:+34932000000"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/10 rounded-lg text-white text-sm hover:bg-white/20 transition-colors"
                    >
                      📞 Llamar
                    </a>
                    <a
                      href="https://wa.me/34932000000"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#25d366]/20 rounded-lg text-white text-sm hover:bg-[#25d366]/30 transition-colors"
                    >
                      💬 WhatsApp
                    </a>
                  </div>
                </div>

                {/* Contact form */}
                <div className="p-6">
                  <h3 className="font-bold text-[#0f1f3d] mb-4">Solicitar información</h3>
                  <ContactForm propertyRef={property.reference} />
                </div>
              </div>

              {/* Share */}
              <div className="mt-4 bg-white rounded-xl shadow p-4 flex items-center justify-between">
                <p className="text-sm text-gray-500">Ref: {property.reference}</p>
                <button className="text-[#c9a84c] text-sm font-medium hover:underline">
                  Compartir ↗
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-[#0f1f3d] font-bold text-2xl mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>
              Propiedades similares
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

// ─── Sub-components ────────────────────────────────────────────────────────────

function FeatureStat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="text-center">
      <span className="text-2xl">{icon}</span>
      <p className="text-[#0f1f3d] font-bold text-lg mt-1">{value}</p>
      <p className="text-gray-400 text-xs">{label}</p>
    </div>
  );
}

function ContactForm({ propertyRef }: { propertyRef: string }) {
  return (
    <form className="space-y-3">
      <input type="hidden" name="ref" value={propertyRef} />
      <input
        type="text"
        name="nombre"
        placeholder="Tu nombre"
        required
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
      />
      <input
        type="email"
        name="email"
        placeholder="Tu email"
        required
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
      />
      <input
        type="tel"
        name="telefono"
        placeholder="Teléfono (opcional)"
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
      />
      <textarea
        name="mensaje"
        rows={3}
        placeholder="Me interesa esta propiedad..."
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
        defaultValue={`Hola, me interesa la propiedad ${propertyRef}. ¿Podríais darme más información?`}
      />
      <button
        type="submit"
        className="w-full py-3 gold-gradient text-[#0f1f3d] font-semibold rounded-lg hover:opacity-90 transition-opacity"
      >
        Enviar consulta
      </button>
      <p className="text-xs text-gray-400 text-center">
        Te responderemos en menos de 24 horas
      </p>
    </form>
  );
}
