import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--navy)] flex flex-col items-center justify-center px-6 text-center">
      <p className="text-[var(--gold)] text-sm font-semibold tracking-[0.3em] uppercase mb-4">
        Error 404
      </p>
      <h1
        className="text-white font-bold mb-4"
        style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(3rem, 8vw, 6rem)' }}
      >
        Página no encontrada
      </h1>
      <p className="text-white/50 text-lg max-w-md mb-10">
        La página que buscas no existe o ha sido eliminada. Es posible que la propiedad ya no esté disponible.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/propiedades"
          className="px-8 py-3.5 gold-gradient text-[var(--navy)] font-semibold rounded hover:opacity-90 transition-opacity"
        >
          Ver propiedades
        </Link>
        <Link
          href="/"
          className="px-8 py-3.5 border border-white/20 text-white font-semibold rounded hover:bg-white/10 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>

      <div className="mt-16 text-white/20 text-sm">
        <p>¿Necesitas ayuda? Llámanos al{' '}
          <a href="tel:+34691294443" className="text-[var(--gold)] hover:underline">+34 691 294 443</a>
        </p>
      </div>
    </div>
  );
}
