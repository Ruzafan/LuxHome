'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const COOKIE_KEY = 'luxhome_cookies';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(COOKIE_KEY)) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, 'accepted');
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem(COOKIE_KEY, 'rejected');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f1f3d] border-t border-white/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <p className="text-white/70 text-xs leading-relaxed max-w-2xl">
          Usamos cookies técnicas propias para recordar tus preferencias.{' '}
          <Link href="/cookies" className="text-[#c9a84c] hover:underline">
            Más información
          </Link>
          .
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={reject}
            className="text-xs text-white/50 hover:text-white/80 transition-colors px-4 py-2 border border-white/20 rounded"
          >
            Rechazar
          </button>
          <button
            onClick={accept}
            className="text-xs font-semibold text-[#0f1f3d] gold-gradient px-4 py-2 rounded hover:opacity-90 transition-opacity"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
