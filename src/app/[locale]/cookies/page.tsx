import { Metadata } from 'next';
import { getAlternates } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Política de Cookies',
  description: 'Política de cookies de Lux Home Inmobiliaria conforme a la LSSI-CE.',
  robots: { index: false, follow: false },
  alternates: getAlternates('/cookies'),
};

export default function CookiesPage() {
  return (
    <div className="pt-20 bg-[var(--cream)]">
      <div className="luxury-gradient py-16 px-6 text-center">
        <p className="text-[var(--rose)] text-sm font-semibold tracking-[0.3em] uppercase mb-2">Transparencia</p>
        <h1 className="text-white font-light text-4xl font-playfair">
          Política de Cookies
        </h1>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16 space-y-10 text-gray-700 text-sm leading-relaxed">

        <section>
          <h2 className="text-[var(--navy)] font-light text-xl mb-3 font-playfair">
            ¿Qué son las cookies?
          </h2>
          <p>Las cookies son pequeños archivos de texto que un sitio web almacena en tu dispositivo cuando lo visitas. Permiten que el sitio recuerde información sobre tu visita para mejorar tu experiencia de navegación.</p>
        </section>

        <section>
          <h2 className="text-[var(--navy)] font-light text-xl mb-3 font-playfair">
            Cookies que utilizamos
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs mt-2">
              <thead>
                <tr className="bg-[var(--navy)] text-white">
                  <th className="px-3 py-2 text-left font-semibold">Nombre</th>
                  <th className="px-3 py-2 text-left font-semibold">Tipo</th>
                  <th className="px-3 py-2 text-left font-semibold">Finalidad</th>
                  <th className="px-3 py-2 text-left font-semibold">Duración</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="px-3 py-2 font-mono">luxhome_cookies</td>
                  <td className="px-3 py-2">Técnica</td>
                  <td className="px-3 py-2">Recordar tu preferencia de aceptación de cookies</td>
                  <td className="px-3 py-2">1 año</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-gray-500 italic">
            Este sitio web <strong>no utiliza actualmente cookies de analítica ni de publicidad</strong>. Si en el futuro se incorporan, esta política se actualizará y se solicitará tu consentimiento.
          </p>
        </section>

        <section>
          <h2 className="text-[var(--navy)] font-light text-xl mb-3 font-playfair">
            Cómo gestionar las cookies
          </h2>
          <p>Puedes configurar tu navegador para bloquear o eliminar cookies. Ten en cuenta que esto puede afectar al funcionamiento del sitio. Instrucciones por navegador:</p>
          <ul className="mt-3 space-y-1.5 list-disc list-inside">
            <li><strong>Chrome:</strong> Configuración → Privacidad y seguridad → Cookies</li>
            <li><strong>Firefox:</strong> Opciones → Privacidad y Seguridad → Cookies</li>
            <li><strong>Safari:</strong> Preferencias → Privacidad → Cookies</li>
            <li><strong>Edge:</strong> Configuración → Cookies y permisos del sitio</li>
          </ul>
        </section>

        <section>
          <h2 className="text-[var(--navy)] font-light text-xl mb-3 font-playfair">
            Actualizaciones de esta política
          </h2>
          <p>Podemos actualizar esta política cuando incorporemos nuevas funcionalidades o servicios que impliquen el uso de cookies. Te informaremos de cualquier cambio relevante mediante un aviso en el sitio web.</p>
        </section>

        <section>
          <h2 className="text-[var(--navy)] font-light text-xl mb-3 font-playfair">
            Contacto
          </h2>
          <p>Para cualquier consulta sobre esta política, puedes contactarnos en <a href="mailto:bego@luxhomein.com" className="text-[var(--rose-dark)] hover:underline">bego@luxhomein.com</a>.</p>
        </section>

        <p className="text-xs text-gray-400 border-t border-gray-200 pt-6">
          Última actualización: abril de 2026
        </p>
      </div>
    </div>
  );
}
