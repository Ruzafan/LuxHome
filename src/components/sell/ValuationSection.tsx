import { Check } from '@phosphor-icons/react/ssr';
import ValuationWizard from '@/components/sell/ValuationWizard';

const reassurances = [
  'Gratis y sin compromiso',
  'Te llamamos en menos de 24 horas',
  'Calculada con ventas reales de la zona',
];

/** Bloque del valorador: texto a la izquierda, asistente de 3 pasos a la derecha. */
export default function ValuationSection({
  title,
  text,
  defaultCity,
}: {
  title: string;
  text: string;
  defaultCity?: string;
}) {
  return (
    <section id="valoracion" className="scroll-mt-24 px-2 md:px-3">
      <div className="rounded-[var(--radius-panel)] py-16 md:py-24" style={{ background: 'var(--rose-soft)' }}>
        <div className="container-lux grid grid-cols-1 gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="lg:pt-6">
            <h2
              className="font-display max-w-[16ch] font-light leading-[1.06]"
              style={{ fontSize: 'clamp(34px, 4vw, 56px)', letterSpacing: '-0.015em' }}
            >
              {title}
            </h2>
            <p className="mt-5 max-w-[46ch] text-[16px] leading-[1.7]" style={{ color: 'var(--mid)' }}>
              {text}
            </p>
            <ul className="mt-8 flex flex-col gap-3">
              {reassurances.map((item) => (
                <li key={item} className="flex items-center gap-3 text-[15px]">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[var(--accent)]">
                    <Check size={15} weight="bold" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <ValuationWizard defaultCity={defaultCity} />
        </div>
      </div>
    </section>
  );
}
