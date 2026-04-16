import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Contacta con LuxHome y recibe respuesta en menos de 24h. Especialistas en compraventa y alquiler en el Vallès Occidental.',
  openGraph: {
    title: 'Contacto | LuxHome',
    description: 'Contacta con LuxHome y recibe respuesta en menos de 24h.',
    url: 'https://luxhomein.com/contacto',
  },
};

const offices = [
  {
    name: 'Oficina — Santa Perpètua de Mogoda',
    address: 'Rambla 27',
    postal: '08130 Santa Perpètua de Mogoda (Barcelona)',
    phone: '+34 931 05 79 65',
    email: 'monica@luxhomein.com',
    hours: 'Lun–Vie 9:30–19:00',
  },
];

export default function ContactoPage() {
  return (
    <div className="pt-20 bg-[#faf8f3]">
      {/* Hero */}
      <div className="luxury-gradient py-16 px-6 text-center">
        <p className="text-[#c9a84c] text-sm font-semibold tracking-[0.3em] uppercase mb-2">Estamos aquí para ti</p>
        <h1 className="text-white font-bold text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>
          Contacto
        </h1>
        <p className="text-white/60 mt-3 max-w-lg mx-auto">
          Cuéntanos qué buscas y un asesor te responderá en menos de 24 horas.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Contact Form */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-[#0f1f3d] font-bold text-2xl mb-1" style={{ fontFamily: 'var(--font-playfair)' }}>
              Envíanos un mensaje
            </h2>
            <p className="text-gray-400 text-sm mb-6">Todos los campos son obligatorios salvo donde se indique.</p>

            <form className="space-y-4">
              {/* Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nombre" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Nombre
                  </label>
                  <input
                    id="nombre"
                    type="text"
                    name="nombre"
                    placeholder="Tu nombre"
                    required
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
                  />
                </div>
                <div>
                  <label htmlFor="apellidos" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Apellidos
                  </label>
                  <input
                    id="apellidos"
                    type="text"
                    name="apellidos"
                    placeholder="Tus apellidos"
                    required
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="tu@email.com"
                    required
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
                  />
                </div>
                <div>
                  <label htmlFor="telefono" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Teléfono <span className="text-gray-300 font-normal">(opcional)</span>
                  </label>
                  <input
                    id="telefono"
                    type="tel"
                    name="telefono"
                    placeholder="+34 600 000 000"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="asunto" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Motivo de consulta
                </label>
                <select
                  id="asunto"
                  name="asunto"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
                  defaultValue=""
                >
                  <option value="" disabled>Selecciona un motivo...</option>
                  <option value="comprar">Quiero comprar una propiedad</option>
                  <option value="alquilar">Quiero alquilar una propiedad</option>
                  <option value="vender">Quiero vender mi propiedad</option>
                  <option value="inversion">Asesoramiento de inversión</option>
                  <option value="valoracion">Solicitar valoración gratuita</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              {/* Budget */}
              <div>
                <label htmlFor="presupuesto" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Presupuesto aproximado <span className="text-gray-300 font-normal">(opcional)</span>
                </label>
                <select
                  id="presupuesto"
                  name="presupuesto"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
                  defaultValue=""
                >
                  <option value="">Sin especificar</option>
                  <option value="300k-500k">300.000€ – 500.000€</option>
                  <option value="500k-1m">500.000€ – 1.000.000€</option>
                  <option value="1m-2m">1.000.000€ – 2.000.000€</option>
                  <option value="2m-5m">2.000.000€ – 5.000.000€</option>
                  <option value="+5m">Más de 5.000.000€</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="mensaje" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Mensaje
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  rows={4}
                  required
                  placeholder="Cuéntanos qué buscas, la zona de preferencia, características importantes..."
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
                />
              </div>

              {/* Privacy */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="privacidad"
                  name="privacidad"
                  required
                  className="mt-1 accent-[#c9a84c]"
                />
                <label htmlFor="privacidad" className="text-xs text-gray-400 leading-relaxed">
                  He leído y acepto la{' '}
                  <a href="/privacidad" className="text-[#c9a84c] hover:underline">
                    Política de Privacidad
                  </a>
                  . Consiento el tratamiento de mis datos para gestionar mi consulta.
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-4 gold-gradient text-[#0f1f3d] font-bold rounded-lg hover:opacity-90 transition-opacity text-sm tracking-wide"
              >
                Enviar mensaje
              </button>
            </form>
          </div>

          {/* Info panel */}
          <div className="lg:col-span-2 space-y-6">
            {offices.map(({ name, address, postal, phone, email, hours }) => (
              <div key={name} className="bg-white rounded-2xl shadow p-6">
                <h3 className="font-bold text-[#0f1f3d] text-base mb-4 pb-3 border-b border-gray-100" style={{ fontFamily: 'var(--font-playfair)' }}>
                  {name}
                </h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-3">
                    <span className="text-[#c9a84c] text-lg leading-none">📍</span>
                    <span>{address}<br />{postal}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-[#c9a84c] text-lg leading-none">📞</span>
                    <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-[#c9a84c] transition-colors">
                      {phone}
                    </a>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-[#c9a84c] text-lg leading-none">✉️</span>
                    <a href={`mailto:${email}`} className="hover:text-[#c9a84c] transition-colors">
                      {email}
                    </a>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#c9a84c] text-lg leading-none">🕐</span>
                    <span className="text-gray-400 text-xs">{hours}</span>
                  </li>
                </ul>
              </div>
            ))}

            {/* WhatsApp CTA */}
            <div className="bg-[#25d366] rounded-2xl p-6 text-white">
              <h3 className="font-bold text-lg mb-2">¿Prefieres WhatsApp?</h3>
              <p className="text-white/80 text-sm mb-4">
                Escríbenos directamente y te atendemos al momento.
              </p>
              <a
                href="https://wa.me/34932000000?text=Hola,%20me%20interesa%20una%20propiedad%20de%20LuxHome"
                className="flex items-center justify-center gap-2 bg-white text-[#25d366] font-semibold px-5 py-3 rounded-lg text-sm hover:bg-green-50 transition-colors"
              >
                💬 Abrir WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
