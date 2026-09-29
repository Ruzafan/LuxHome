import { getTranslations } from 'next-intl/server';
import { Ear, ChartLineUp, Megaphone, Handshake, Check } from '@phosphor-icons/react/ssr';

const stepIcons = [Ear, ChartLineUp, Megaphone, Handshake];
// Staircase offset on desktop so the steps read as a progression, not a flat row
const stepOffsets = ['', 'lg:mt-10', 'lg:mt-20', 'lg:mt-30'];

export default async function SellProcess({ title }: { title?: string }) {
  const t = await getTranslations('sell');
  const steps = t.raw('process.steps') as Array<{ title: string; text: string }>;

  return (
    <section className="px-2 md:px-3">
      <div className="rounded-[var(--radius-panel)] py-20 md:py-28" style={{ background: 'var(--bg2)' }}>
        <div className="container-lux">
          <h2
            className="reveal font-display max-w-[20ch] font-light leading-[1.06]"
            style={{ fontSize: 'clamp(34px, 4vw, 56px)', letterSpacing: '-0.015em' }}
          >
            {title ?? t('process.title')}
          </h2>
          <ol className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {steps.map((step, i) => {
              const Icon = stepIcons[i] ?? Check;
              return (
                <li
                  key={step.title}
                  className={`reveal reveal-delay-${i + 1} flex flex-col rounded-[var(--radius-card)] bg-white p-7 ${stepOffsets[i] ?? ''}`}
                >
                  <span className="mb-10 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--dark)] text-[var(--rose)]">
                    <Icon size={22} weight="light" />
                  </span>
                  <h3 className="font-display text-[26px] font-light leading-[1.15]">{step.title}</h3>
                  <p className="mt-3 text-[15px] leading-[1.7]" style={{ color: 'var(--mid)' }}>{step.text}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
