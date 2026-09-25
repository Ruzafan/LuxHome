'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';

const COOKIE_KEY = 'luxhome_cookies';

export default function CookieBanner() {
  const t = useTranslations('cookies');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(COOKIE_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const save = (value: 'accepted' | 'rejected') => {
    try {
      localStorage.setItem(COOKIE_KEY, value);
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      className="glass-panel animate-fade-in fixed inset-x-3 bottom-20 z-50 rounded-[var(--radius-card)] p-5 md:bottom-6 md:left-6 md:right-auto md:max-w-[420px]"
    >
      <p className="mb-4 text-[14px] leading-relaxed" style={{ color: 'var(--mid)' }}>
        {t.rich('message', {
          link: (chunks) => (
            <Link href="/cookies" className="underline underline-offset-2" style={{ color: 'var(--accent)' }}>
              {chunks}
            </Link>
          ),
        })}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => save('rejected')}
          className="btn flex-1 !py-2.5"
          style={{ boxShadow: 'inset 0 0 0 1px var(--line)', color: 'var(--dark)' }}
        >
          {t('reject')}
        </button>
        <button onClick={() => save('accepted')} className="btn btn-primary flex-1 !py-2.5">
          {t('accept')}
        </button>
      </div>
    </div>
  );
}
