import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-[#0f1f3d] text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <Image
                src="/logo.png"
                alt="LuxHome Inmobiliaria"
                width={160}
                height={56}
                className="h-14 w-auto object-contain brightness-0 invert"
              />
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Nuestros asesores cuentan con años de experiencia en el sector inmobiliario del Vallès Occidental y alrededores. Cercanos, honestos y profesionales.
            </p>
            <div className="flex gap-3 mt-6">
              {['fb', 'ig', 'in', 'yt'].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:border-[#c9a84c] hover:text-[#c9a84c] transition-colors text-xs uppercase font-bold"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Propiedades */}
          <div>
            <h3 className="text-[#c9a84c] font-semibold text-sm tracking-widest uppercase mb-4">
              Propiedades
            </h3>
            <ul className="space-y-2">
              {[
                { label: 'Venta', href: '/propiedades?operacion=venta' },
                { label: 'Alquiler', href: '/propiedades?operacion=alquiler' },
                { label: 'Obra nueva', href: '/propiedades?tipo=nueva' },
                { label: 'Chalets', href: '/propiedades?tipo=chalet' },
                { label: 'Pisos', href: '/propiedades?tipo=piso' },
                { label: 'Áticos', href: '/propiedades?tipo=atico' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-white/60 hover:text-[#c9a84c] text-sm transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Zonas */}
          <div>
            <h3 className="text-[#c9a84c] font-semibold text-sm tracking-widest uppercase mb-4">
              Zonas
            </h3>
            <ul className="space-y-2">
              {['Santa Perpètua de Mogoda', 'Montcada i Reixac', 'Vilanova del Vallès', 'Castelldefels', 'Sant Adrià de Besòs', 'Les Franqueses del Vallès'].map(
                (zone) => (
                  <li key={zone}>
                    <Link
                      href={`/propiedades?ciudad=${encodeURIComponent(zone)}`}
                      className="text-white/60 hover:text-[#c9a84c] text-sm transition-colors"
                    >
                      {zone}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-[#c9a84c] font-semibold text-sm tracking-widest uppercase mb-4">
              Contacto
            </h3>
            <ul className="space-y-3 text-sm text-white/60">
              <li>
                <span className="block text-white/40 text-xs mb-1">Oficina</span>
                Rambla 27<br />08130 Santa Perpètua de Mogoda
              </li>
              <li>
                <a href="tel:+34931057965" className="hover:text-[#c9a84c] transition-colors">
                  +34 931 05 79 65
                </a>
              </li>
              <li>
                <a href="mailto:monica@luxhomein.com" className="hover:text-[#c9a84c] transition-colors">
                  monica@luxhomein.com
                </a>
              </li>
              <li>
                <span className="block text-white/40 text-xs mb-1">Horario</span>
                Lun–Vie 9:30–19:00
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>© {new Date().getFullYear()} LuxHome. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <Link href="/privacidad" className="hover:text-white/70 transition-colors">Política de Privacidad</Link>
            <Link href="/cookies" className="hover:text-white/70 transition-colors">Cookies</Link>
            <Link href="/aviso-legal" className="hover:text-white/70 transition-colors">Aviso Legal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
