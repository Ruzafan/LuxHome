import React from 'react';

/**
 * Inset, rounded page header shared by inner pages (listings, contact, legal).
 * Keeps the framed-panel language of the home hero instead of a full-bleed band.
 */
export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="px-2 pt-2 md:px-3 md:pt-3">
      <div
        className="relative isolate overflow-hidden rounded-[var(--radius-panel)]"
        style={{ background: 'var(--dark)' }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-48 -z-10 h-[480px] w-[480px] rounded-full opacity-50 blur-3xl"
          style={{ background: 'radial-gradient(circle, #9a5b7b 0%, transparent 70%)' }}
        />
        <div className="container-lux pb-12 pt-32 md:pb-16 md:pt-36">
          {eyebrow && (
            <p className="mb-4 text-[13px]" style={{ color: 'var(--rose)' }}>
              {eyebrow}
            </p>
          )}
          <h1
            className="font-display max-w-[18ch] font-light leading-[1.05] text-white"
            style={{ fontSize: 'clamp(40px, 5vw, 68px)', letterSpacing: '-0.015em' }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="mt-5 max-w-[56ch] text-[16px] leading-[1.7]" style={{ color: 'oklch(100% 0 0 / 0.65)' }}>
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}
