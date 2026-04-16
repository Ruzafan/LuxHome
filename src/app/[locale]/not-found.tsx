import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function LocaleNotFound() {
  const t = await getTranslations('property');

  return (
    <div className="min-h-screen bg-[#0f1f3d] flex flex-col items-center justify-center px-6 text-center pt-20">
      <p className="text-[#c9a84c] text-sm font-semibold tracking-[0.3em] uppercase mb-4">
        Error 404
      </p>
      <h1
        className="text-white font-bold mb-4"
        style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(3rem, 8vw, 6rem)' }}
      >
        {t('notFound')}
      </h1>
      <p className="text-white/50 text-lg max-w-md mb-10">
        {t('notFoundHint')}
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/propiedades"
          className="px-8 py-3.5 gold-gradient text-[#0f1f3d] font-semibold rounded hover:opacity-90 transition-opacity"
        >
          {t('back')}
        </Link>
        <Link
          href="/"
          className="px-8 py-3.5 border border-white/20 text-white font-semibold rounded hover:bg-white/10 transition-colors"
        >
          {t('home')}
        </Link>
      </div>

      <div className="mt-16 text-white/20 text-sm">
        <p>
          <a href="tel:+34931057965" className="text-[#c9a84c] hover:underline">+34 931 05 79 65</a>
          {' '}·{' '}
          <a href="https://wa.me/34931057965" className="text-[#c9a84c] hover:underline">WhatsApp</a>
        </p>
      </div>
    </div>
  );
}
