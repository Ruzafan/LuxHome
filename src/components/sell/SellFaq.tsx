import { Plus } from '@phosphor-icons/react/ssr';

export interface FaqItem {
  question: string;
  answer: string;
}

/** Preguntas frecuentes en acordeón + JSON-LD FAQPage para Google */
export default function SellFaq({ title, items }: { title: string; items: FaqItem[] }) {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  return (
    <section className="container-lux grid grid-cols-1 gap-10 py-20 md:py-28 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <h2
        className="reveal font-display font-light leading-[1.06]"
        style={{ fontSize: 'clamp(34px, 4vw, 56px)', letterSpacing: '-0.015em' }}
      >
        {title}
      </h2>
      <div className="flex flex-col gap-3">
        {items.map((item, i) => (
          <details
            key={item.question}
            className={`reveal reveal-delay-${Math.min(i + 1, 4)} group rounded-[var(--radius-card)] bg-white px-6 py-5 open:pb-6`}
            style={{ boxShadow: 'inset 0 0 0 1px var(--line)' }}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[17px] font-normal [&::-webkit-details-marker]:hidden">
              {item.question}
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--bg2)] transition-transform duration-300 group-open:rotate-45">
                <Plus size={16} />
              </span>
            </summary>
            <p className="mt-3 max-w-[60ch] text-[15px] leading-[1.7]" style={{ color: 'var(--mid)' }}>
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
