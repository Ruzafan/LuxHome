'use client';

import { Phone, WhatsappLogo } from '@phosphor-icons/react';

const WHATSAPP_URL = 'https://wa.me/34691294443?text=Hola,%20me%20interesa%20una%20propiedad%20de%20LuxHome';

export default function WhatsAppButton() {
  return (
    <>
      {/* Mobile floating action pill */}
      <div
        className="glass-panel fixed inset-x-3 bottom-3 z-40 flex items-center gap-2 rounded-full p-1.5 md:hidden"
      >
        <a
          href="tel:+34691294443"
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[var(--dark)] text-[14px] text-white transition-transform active:scale-[0.98]"
        >
          <Phone size={17} weight="light" />
          Llamar
        </a>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#1f9d55] text-[14px] text-white transition-transform active:scale-[0.98]"
        >
          <WhatsappLogo size={18} weight="fill" />
          WhatsApp
        </a>
      </div>

      {/* Desktop floating WhatsApp bubble */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        className="fixed bottom-6 right-6 z-40 hidden h-14 w-14 items-center justify-center rounded-full bg-[#1f9d55] text-white transition-transform duration-300 hover:-translate-y-0.5 md:flex"
        style={{ boxShadow: '0 14px 30px -10px oklch(45% 0.12 150 / 0.6)' }}
      >
        <WhatsappLogo size={28} weight="fill" />
      </a>
    </>
  );
}
