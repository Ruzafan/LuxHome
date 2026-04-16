import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('contact');
  return {
    title: t('title'),
    description: t('subtitle'),
    openGraph: {
      title: `${t('title')} | LuxHome`,
      url: 'https://luxhomein.com/contacto',
    },
  };
}

export default async function ContactoPage() {
  const t = await getTranslations('contact');

  return (
    <div className="pt-20 bg-[#faf8f3]">
      {/* Hero */}
      <div className="luxury-gradient py-16 px-6 text-center">
        <p className="text-[#c9a84c] text-sm font-semibold tracking-[0.3em] uppercase mb-2">{t('badge')}</p>
        <h1 className="text-white font-bold text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>
          {t('title')}
        </h1>
        <p className="text-white/60 mt-3 max-w-lg mx-auto">{t('subtitle')}</p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Contact Form */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-[#0f1f3d] font-bold text-2xl mb-1" style={{ fontFamily: 'var(--font-playfair)' }}>
              {t('form.title')}
            </h2>
            <p className="text-gray-400 text-sm mb-6">{t('form.subtitle')}</p>

            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nombre" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    {t('form.name')}
                  </label>
                  <input id="nombre" type="text" name="nombre" required
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]" />
                </div>
                <div>
                  <label htmlFor="apellidos" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    {t('form.surname')}
                  </label>
                  <input id="apellidos" type="text" name="apellidos" required
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    {t('form.email')}
                  </label>
                  <input id="email" type="email" name="email" required
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]" />
                </div>
                <div>
                  <label htmlFor="telefono" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    {t('form.phone')} <span className="text-gray-300 font-normal">{t('form.phoneOptional')}</span>
                  </label>
                  <input id="telefono" type="tel" name="telefono"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]" />
                </div>
              </div>

              <div>
                <label htmlFor="asunto" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  {t('form.subject')}
                </label>
                <select id="asunto" name="asunto" defaultValue=""
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]">
                  <option value="" disabled>{t('form.subjectPlaceholder')}</option>
                  <option value="comprar">{t('form.subjectBuy')}</option>
                  <option value="alquilar">{t('form.subjectRent')}</option>
                  <option value="vender">{t('form.subjectSell')}</option>
                  <option value="inversion">{t('form.subjectInvest')}</option>
                  <option value="valoracion">{t('form.subjectValuation')}</option>
                  <option value="otro">{t('form.subjectOther')}</option>
                </select>
              </div>

              <div>
                <label htmlFor="presupuesto" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  {t('form.budget')}
                </label>
                <select id="presupuesto" name="presupuesto" defaultValue=""
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]">
                  <option value="">{t('form.budgetNone')}</option>
                  <option value="100k-200k">100.000€ – 200.000€</option>
                  <option value="200k-400k">200.000€ – 400.000€</option>
                  <option value="400k-700k">400.000€ – 700.000€</option>
                  <option value="+700k">Más de 700.000€</option>
                </select>
              </div>

              <div>
                <label htmlFor="mensaje" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  {t('form.message')}
                </label>
                <textarea id="mensaje" name="mensaje" rows={4} required
                  placeholder={t('form.messagePlaceholder')}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#c9a84c]" />
              </div>

              <div className="flex items-start gap-3">
                <input type="checkbox" id="privacidad" name="privacidad" required className="mt-1 accent-[#c9a84c]" />
                <label htmlFor="privacidad" className="text-xs text-gray-400 leading-relaxed">
                  {t.rich('form.privacy', {
                    link: (chunks) => (
                      <Link href="/privacidad" className="text-[#c9a84c] hover:underline">
                        {chunks}
                      </Link>
                    ),
                  })}
                </label>
              </div>

              <button type="submit"
                className="w-full py-4 gold-gradient text-[#0f1f3d] font-bold rounded-lg hover:opacity-90 transition-opacity text-sm tracking-wide">
                {t('form.submit')}
              </button>
            </form>
          </div>

          {/* Info panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="font-bold text-[#0f1f3d] text-base mb-4 pb-3 border-b border-gray-100" style={{ fontFamily: 'var(--font-playfair)' }}>
                {t('office')}
              </h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="text-[#c9a84c] text-lg leading-none">📍</span>
                  <span>Rambla 27<br />08130 Santa Perpètua de Mogoda (Barcelona)</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-[#c9a84c] text-lg leading-none">📞</span>
                  <a href="tel:+34931057965" className="hover:text-[#c9a84c] transition-colors">+34 931 05 79 65</a>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-[#c9a84c] text-lg leading-none">✉️</span>
                  <a href="mailto:monica@luxhomein.com" className="hover:text-[#c9a84c] transition-colors">
                    monica@luxhomein.com
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#c9a84c] text-lg leading-none">🕐</span>
                  <span className="text-gray-400 text-xs">{t('hours')}</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#25d366] rounded-2xl p-6 text-white">
              <h3 className="font-bold text-lg mb-2">{t('whatsapp.title')}</h3>
              <p className="text-white/80 text-sm mb-4">{t('whatsapp.subtitle')}</p>
              <a
                href="https://wa.me/34931057965?text=Hola,%20me%20interesa%20una%20propiedad%20de%20LuxHome"
                className="flex items-center justify-center gap-2 bg-white text-[#25d366] font-semibold px-5 py-3 rounded-lg text-sm hover:bg-green-50 transition-colors"
              >
                💬 {t('whatsapp.button')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
