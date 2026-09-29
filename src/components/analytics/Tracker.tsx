'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { track } from '@/lib/track';

/** Registra una visita por cambio de ruta y los clics a teléfono / WhatsApp. */
export default function Tracker() {
  const pathname = usePathname();

  useEffect(() => {
    track('pageview');
  }, [pathname]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const link = (e.target as HTMLElement | null)?.closest('a');
      const href = link?.getAttribute('href') ?? '';
      if (href.startsWith('tel:')) track('phone_click');
      else if (href.includes('wa.me/') || href.includes('whatsapp.com')) track('whatsapp_click');
    }
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);

  return null;
}
