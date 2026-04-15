import Link from 'next/link';
import Image from 'next/image';
import { getFeaturedProperties, getAllLocations } from '@/lib/propertyService';
import PropertyCard from '@/components/properties/PropertyCard';
import LocationAutocomplete from '@/components/ui/LocationAutocomplete';

export default async function HomePage() {
  const [featured, locations] = await Promise.all([
    getFeaturedProperties(4),
    Promise.resolve(getAllLocations()),
  ]);

  return (
    <>
      {/* ─── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920"
            alt="Propiedad de lujo"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 luxury-gradient opacity-75" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pb-20 md:pb-0">
          <p className="text-[#c9a84c] text-sm font-semibold tracking-[0.3em] uppercase mb-4 animate-fade-in">
            Inmobiliaria · Santa Perpètua de Mogoda &amp; Vallès Occidental
          </p>
          <h1
            className="text-white font-bold leading-tight mb-6 animate-fade-in"
            style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(2.5rem, 6vw, 5rem)', animationDelay: '0.1s' }}
          >
            Tu hogar, nuestra misión
          </h1>
          <p
            className="text-white/75 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto animate-fade-in"
            style={{ animationDelay: '0.2s' }}
          >
            Mónica, Vanesa y Bego te acompañan en cada paso de la compra o venta de tu propiedad. Especialistas en el Vallès Occidental y alrededores.
          </p>

          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <QuickSearch locations={locations} />
          </div>

          <div className="grid grid-cols-3 gap-4 md:gap-8 mt-8 md:mt-16 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            {[
              { value: '12', label: 'Propiedades activas' },
              { value: '3', label: 'Expertas a tu lado' },
              { value: '6', label: 'Zonas de actuación' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-[#c9a84c] font-bold text-2xl md:text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>
                  {value}
                </p>
                <p className="text-white/60 text-xs md:text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-white/40 text-xs">
          <span>Descubre más</span>
          <div className="w-px h-8 bg-white/30 animate-bounce" />
        </div>
      </section>

      {/* ─── Featured Properties ───────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#faf8f3]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#c9a84c] text-sm font-semibold tracking-[0.3em] uppercase mb-2">Selección exclusiva</p>
            <h2
              className="text-[#0f1f3d] font-bold text-4xl gold-line gold-line-center"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Propiedades Destacadas
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {featured.map((property) => (
              <PropertyCard key={property.id} property={property} featured />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/propiedades"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded border-2 border-[#0f1f3d] text-[#0f1f3d] font-semibold hover:bg-[#0f1f3d] hover:text-white transition-all duration-300"
            >
              Ver todas las propiedades
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Why LuxHome ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 luxury-gradient">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#c9a84c] text-sm font-semibold tracking-[0.3em] uppercase mb-2">Nuestros valores</p>
            <h2 className="text-white font-bold text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>
              Por qué elegir LuxHome
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="text-center p-8 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="w-14 h-14 rounded-full gold-gradient flex items-center justify-center mx-auto mb-5 text-2xl">
                  {icon}
                </div>
                <h3 className="text-white font-semibold text-xl mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>
                  {title}
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Zonas ────────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#c9a84c] text-sm font-semibold tracking-[0.3em] uppercase mb-2">Nuestras zonas</p>
            <h2
              className="text-[#0f1f3d] font-bold text-4xl gold-line gold-line-center"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Dónde operamos
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
            {zones.map(({ label, count, img }) => (
              <Link
                key={label}
                href={`/propiedades?ciudad=${encodeURIComponent(label)}`}
                className="group relative rounded-xl overflow-hidden block"
                style={{ aspectRatio: '3/4' }}
              >
                <Image
                  src={img}
                  alt={label}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white font-semibold text-sm">{label}</p>
                  <p className="text-[#c9a84c] text-xs">{count} propiedades</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#faf8f3]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#c9a84c] text-sm font-semibold tracking-[0.3em] uppercase mb-2">Testimonios</p>
            <h2
              className="text-[#0f1f3d] font-bold text-4xl gold-line gold-line-center"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Lo que dicen nuestros clientes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {testimonials.map(({ name, role, text, stars }) => (
              <div key={name} className="bg-white rounded-xl p-6 shadow-md">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: stars }).map((_, i) => (
                    <span key={i} className="text-[#c9a84c] text-lg">★</span>
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 italic">&ldquo;{text}&rdquo;</p>
                <div>
                  <p className="font-semibold text-[#0f1f3d] text-sm">{name}</p>
                  <p className="text-gray-400 text-xs">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 gold-gradient">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-[#0f1f3d] font-bold text-4xl mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
            ¿Buscas algo especial?
          </h2>
          <p className="text-[#0f1f3d]/70 text-lg mb-8">
            Cuéntanos qué propiedad buscas y nuestros asesores te contactarán en menos de 24 horas.
          </p>
          <Link
            href="/contacto"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#0f1f3d] text-white font-semibold rounded hover:bg-[#1a3260] transition-colors"
          >
            Hablar con un asesor
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}

function QuickSearch({ locations }: { locations: string[] }) {
  return (
    <form
      action="/propiedades"
      method="get"
      className="bg-white/10 backdrop-blur-md rounded-2xl p-2 flex flex-col md:flex-row gap-2 max-w-3xl mx-auto border border-white/20"
    >
      <select
        name="operacion"
        className="flex-1 bg-white rounded-xl pl-4 pr-10 py-3 text-[#0f1f3d] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
        defaultValue=""
      >
        <option value="">Comprar o alquilar</option>
        <option value="venta">Comprar</option>
        <option value="alquiler">Alquilar</option>
      </select>

      <select
        name="tipo"
        className="flex-1 bg-white rounded-xl pl-4 pr-10 py-3 text-[#0f1f3d] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
        defaultValue=""
      >
        <option value="">Tipo de propiedad</option>
        <option value="piso">Piso</option>
        <option value="chalet">Chalet</option>
        <option value="atico">Ático</option>
        <option value="casa">Casa</option>
      </select>

      <LocationAutocomplete
        suggestions={locations}
        placeholder="Ciudad o zona"
        name="ciudad"
        inputClassName="w-full bg-white rounded-xl px-4 py-3 text-[#0f1f3d] text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
      />

      <button
        type="submit"
        className="gold-gradient text-[#0f1f3d] font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap"
      >
        Buscar
      </button>
    </form>
  );
}

const services = [
  {
    icon: '🏠',
    title: 'Compra y venta',
    desc: 'Te ayudamos a encontrar el inmueble que buscas o a vender el tuyo al mejor precio, con total transparencia en cada paso.',
  },
  {
    icon: '🤝',
    title: 'Trato cercano y profesional',
    desc: 'Mónica, Vanesa y Bego te acompañan personalmente desde la primera visita hasta la firma ante notario.',
  },
  {
    icon: '🏡',
    title: 'Alquiler',
    desc: 'Gestionamos el alquiler de tu propiedad o te ayudamos a encontrar el piso o casa que necesitas en la zona.',
  },
  {
    icon: '🏗️',
    title: 'Obra nueva',
    desc: 'Acceso a las mejores promociones de obra nueva del Vallès Occidental con condiciones preferentes.',
  },
  {
    icon: '🏦',
    title: 'Asesoría hipotecaria',
    desc: 'Te orientamos con las mejores opciones de financiación para que tu compra sea sencilla y sin sorpresas.',
  },
  {
    icon: '📋',
    title: 'Gestión documental',
    desc: 'Nos ocupamos de toda la tramitación: contratos, certificados, cambios de titularidad y coordinación con notaría.',
  },
];

const zones = [
  { label: 'Santa Perpètua de Mogoda', count: 7, img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
  { label: 'Castelldefels', count: 1, img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' },
  { label: 'Vilanova del Vallès', count: 1, img: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=400' },
  { label: 'Montcada i Reixac', count: 1, img: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400' },
  { label: 'Sant Adrià de Besòs', count: 1, img: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400' },
  { label: 'Les Franqueses del Vallès', count: 1, img: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=400' },
];

const testimonials = [
  {
    name: 'Jordi P.',
    role: 'Comprador — Santa Perpètua de Mogoda',
    text: 'Mónica nos ayudó a encontrar exactamente lo que buscábamos. Trato cercano, muy profesional y siempre disponible para resolver nuestras dudas. Totalmente recomendable.',
    stars: 5,
  },
  {
    name: 'Marta G.',
    role: 'Vendedora — Ático Santa Perpètua',
    text: 'Vendieron mi piso mucho más rápido de lo que esperaba y al precio que pedíamos. El equipo de Lux Home conoce muy bien la zona y saben cómo llegar a los compradores.',
    stars: 5,
  },
  {
    name: 'Família Soler',
    role: 'Compradores — Casa adosada Vallès',
    text: 'Vanesa y Bego fueron un apoyo fundamental durante todo el proceso. Gestionaron todo, desde la visita hasta la firma. Nos sentimos acompañados en todo momento.',
    stars: 5,
  },
];
