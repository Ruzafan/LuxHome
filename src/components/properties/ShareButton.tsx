'use client';

import { useTranslations } from 'next-intl';

interface Props {
  title: string;
  url: string;
}

export default function ShareButton({ title, url }: Props) {
  const t = useTranslations('property');

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled — do nothing
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(url);
      alert(t('shareCopied'));
    }
  }

  return (
    <button
      onClick={handleShare}
      className="text-sm font-medium hover:underline flex items-center gap-1"
      style={{ color: 'var(--rose-dark)' }}
    >
      {t('share')} ↗
    </button>
  );
}
