import { Link } from '@/i18n/navigation';
import { SELL_COMARCAS } from '@/data/sellZones';

/** Enlaces a las páginas de captación por municipio, agrupados por comarca (enlazado interno SEO). */
export default function SellZonesLinks({
  title,
  currentSlug,
  onlyComarcaId,
}: {
  title: string;
  currentSlug?: string;
  /** Si se indica, solo muestra esa comarca (p. ej. "municipios cercanos") */
  onlyComarcaId?: string;
}) {
  const comarcas = onlyComarcaId ? SELL_COMARCAS.filter((c) => c.id === onlyComarcaId) : SELL_COMARCAS;

  return (
    <section className="container-lux py-20 md:py-24">
      <h2
        className="reveal font-display mb-10 max-w-[22ch] font-light leading-[1.06]"
        style={{ fontSize: 'clamp(32px, 3.6vw, 48px)', letterSpacing: '-0.015em' }}
      >
        {title}
      </h2>
      <div className="flex flex-col gap-10">
        {comarcas.map((comarca) => (
          <div key={comarca.id} className="reveal">
            {!onlyComarcaId && <h3 className="mb-4 text-[15px] text-[var(--mid)]">{comarca.name}</h3>}
            <ul className="flex flex-wrap gap-2">
              {comarca.municipalities
                .filter((m) => m.slug !== currentSlug)
                .map((m) => (
                  <li key={m.slug}>
                    <Link
                      href={`/vender-mi-inmueble/${m.slug}`}
                      className="block rounded-full bg-white px-4 py-2 text-[14px] text-[var(--dark)] transition-colors hover:bg-[var(--rose-soft)]"
                      style={{ boxShadow: 'inset 0 0 0 1px var(--line)' }}
                    >
                      {m.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
