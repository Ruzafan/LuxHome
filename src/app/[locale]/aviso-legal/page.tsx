import { Metadata } from 'next';
import { getAlternates } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Aviso Legal',
  description: 'Aviso legal de Lux Home Inmobiliaria conforme a la LSSI-CE.',
  robots: { index: false, follow: false },
  alternates: getAlternates('/aviso-legal'),
};

export default function AvisoLegalPage() {
  return (
    <div className="pt-20 bg-[var(--cream)]">
      <div className="luxury-gradient py-16 px-6 text-center">
        <p className="text-[var(--rose)] text-sm font-semibold tracking-[0.3em] uppercase mb-2">Información legal</p>
        <h1 className="text-white font-light text-4xl font-playfair">
          Aviso Legal
        </h1>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16 space-y-10 text-gray-700 text-sm leading-relaxed">

        <section>
          <h2 className="text-[var(--navy)] font-light text-xl mb-3 font-playfair">
            1. Datos identificativos del titular
          </h2>
          <p>En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa de los datos identificativos del titular de este sitio web:</p>
          <ul className="mt-4 space-y-1.5 border-l-2 border-[var(--rose)] pl-4">
            <li><strong>Denominación social:</strong> <span className="bg-yellow-100 px-1 rounded">[RAZÓN SOCIAL PENDIENTE — Ej: Lux Home Inmobiliaria S.L.]</span></li>
            <li><strong>CIF/NIF:</strong> <span className="bg-yellow-100 px-1 rounded">[CIF/NIF PENDIENTE]</span></li>
            <li><strong>Domicilio social:</strong> Rambla 27, 08130 Santa Perpètua de Mogoda (Barcelona)</li>
            <li><strong>Teléfono:</strong> +34 691 294 443</li>
            <li><strong>Email:</strong> bego@luxhomein.com</li>
            <li><strong>Web:</strong> luxhomein.com</li>
            <li><strong>Registro Mercantil:</strong> <span className="bg-yellow-100 px-1 rounded">[DATOS REGISTRO MERCANTIL PENDIENTE]</span></li>
          </ul>
        </section>

        <section>
          <h2 className="text-[var(--navy)] font-light text-xl mb-3 font-playfair">
            2. Objeto y ámbito de aplicación
          </h2>
          <p>El presente Aviso Legal regula el acceso y uso del sitio web <strong>luxhomein.com</strong>, titularidad de Lux Home Inmobiliaria, con domicilio en Santa Perpètua de Mogoda (Barcelona). El acceso al sitio web implica la aceptación plena y sin reservas de las presentes condiciones.</p>
        </section>

        <section>
          <h2 className="text-[var(--navy)] font-light text-xl mb-3 font-playfair">
            3. Propiedad intelectual e industrial
          </h2>
          <p>Los contenidos de este sitio web —textos, imágenes, logotipos, diseño y código— son propiedad de Lux Home Inmobiliaria o de terceros que han autorizado su uso. Queda prohibida su reproducción, distribución o modificación sin autorización expresa y por escrito del titular.</p>
        </section>

        <section>
          <h2 className="text-[var(--navy)] font-light text-xl mb-3 font-playfair">
            4. Responsabilidad
          </h2>
          <p>Lux Home Inmobiliaria no se responsabiliza de los daños derivados del uso del sitio web, de posibles errores en los contenidos ni de la disponibilidad técnica del mismo. Los precios e información de los inmuebles son orientativos y pueden estar sujetos a cambios sin previo aviso.</p>
        </section>

        <section>
          <h2 className="text-[var(--navy)] font-light text-xl mb-3 font-playfair">
            5. Legislación aplicable y jurisdicción
          </h2>
          <p>Las presentes condiciones se rigen por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales de Barcelona, con renuncia expresa a cualquier otro fuero que pudiera corresponderles.</p>
        </section>

        <p className="text-xs text-gray-400 border-t border-gray-200 pt-6">
          Última actualización: abril de 2026
        </p>
      </div>
    </div>
  );
}
