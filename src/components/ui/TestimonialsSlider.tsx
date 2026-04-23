'use client';

import { useState, useEffect } from 'react';

type Testimonial = {
  name: string;
  initials: string;
  role: string;
  text: string;
  stars: number;
};

export default function TestimonialsSlider({ testimonials }: { testimonials: Testimonial[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const t = testimonials[current];

  return (
    <div>
      <div className="grid gap-20 items-start min-h-[200px]" style={{ gridTemplateColumns: '1fr 280px' }}>
        <p
          className="font-light italic leading-relaxed"
          style={{
            fontFamily: 'var(--font-cormorant), Georgia, serif',
            fontSize: 'clamp(18px, 2.2vw, 26px)',
            color: 'oklch(100% 0 0 / 0.82)',
          }}
        >
          &ldquo;{t.text}&rdquo;
        </p>
        <div className="pt-1.5">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-white mb-4"
            style={{ background: 'var(--accent)', fontFamily: 'var(--font-cormorant)', fontSize: '18px' }}
          >
            {t.initials}
          </div>
          <span
            className="block mb-1"
            style={{ fontFamily: 'var(--font-cormorant)', fontSize: '18px', color: 'white' }}
          >
            {t.name}
          </span>
          <span className="text-[12px] tracking-[0.1em] uppercase" style={{ color: 'oklch(100% 0 0 / 0.4)' }}>
            {t.role}
          </span>
          <div className="mt-3 tracking-[2px] text-sm" style={{ color: 'var(--gold)' }}>
            {'★'.repeat(t.stars)}
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="flex gap-2 mt-12">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="h-[2px] border-none cursor-pointer transition-all duration-300"
            style={{
              width: i === current ? '40px' : '24px',
              background: i === current ? 'white' : 'oklch(100% 0 0 / 0.2)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
