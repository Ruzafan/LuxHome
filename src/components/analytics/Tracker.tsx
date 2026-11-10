'use client';

import { useEffect } from 'react';
import { track } from '@/lib/track';

/**
 * Registra los clics a teléfono / WhatsApp. Las visitas las cuenta Vercel Web Analytics
 * (<Analytics /> en el layout) para no despertar la base de datos en cada página vista.
 */
export default function Tracker() {
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
