import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Política de privacidad de Lux Home Inmobiliaria conforme al RGPD y la LOPDGDD.',
};

export default function PrivacidadPage() {
  return (
    <div className="pt-20 bg-[#faf8f3]">
      <div className="luxury-gradient py-16 px-6 text-center">
        <p className="text-[#c9a84c] text-sm font-semibold tracking-[0.3em] uppercase mb-2">Tus datos, tu control</p>
        <h1 className="text-white font-bold text-4xl font-playfair">
          Política de Privacidad
        </h1>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16 space-y-10 text-gray-700 text-sm leading-relaxed">

        <section>
          <h2 className="text-[#0f1f3d] font-bold text-xl mb-3 font-playfair">
            1. Responsable del tratamiento
          </h2>
          <ul className="space-y-1.5 border-l-2 border-[#c9a84c] pl-4">
            <li><strong>Identidad:</strong> <span className="bg-yellow-100 px-1 rounded">[RAZÓN SOCIAL PENDIENTE]</span></li>
            <li><strong>CIF/NIF:</strong> <span className="bg-yellow-100 px-1 rounded">[CIF/NIF PENDIENTE]</span></li>
            <li><strong>Dirección:</strong> Rambla 27, 08130 Santa Perpètua de Mogoda (Barcelona)</li>
            <li><strong>Teléfono:</strong> +34 931 05 79 65</li>
            <li><strong>Email de contacto:</strong> monica@luxhomein.com</li>
          </ul>
        </section>

        <section>
          <h2 className="text-[#0f1f3d] font-bold text-xl mb-3 font-playfair">
            2. Finalidad del tratamiento
          </h2>
          <p>Tratamos los datos personales que nos facilitas a través del formulario de contacto para:</p>
          <ul className="mt-3 space-y-2 list-disc list-inside">
            <li>Gestionar tu consulta o solicitud de información sobre inmuebles.</li>
            <li>Contactarte para concertar visitas o enviarte información que hayas solicitado.</li>
            <li>Cumplir con las obligaciones legales aplicables a la actividad inmobiliaria.</li>
          </ul>
          <p className="mt-3">No elaboramos perfiles comerciales ni cedemos tus datos a terceros sin tu consentimiento, salvo obligación legal.</p>
        </section>

        <section>
          <h2 className="text-[#0f1f3d] font-bold text-xl mb-3 font-playfair">
            3. Base jurídica
          </h2>
          <p>El tratamiento se basa en tu consentimiento expreso (art. 6.1.a RGPD), otorgado al marcar la casilla de aceptación antes de enviar el formulario. Puedes retirar tu consentimiento en cualquier momento sin que ello afecte a la licitud del tratamiento previo.</p>
        </section>

        <section>
          <h2 className="text-[#0f1f3d] font-bold text-xl mb-3 font-playfair">
            4. Plazo de conservación
          </h2>
          <p>Conservaremos tus datos durante el tiempo necesario para atender tu consulta y, posteriormente, durante los plazos legalmente exigidos (mínimo 3 años para comunicaciones comerciales). Una vez finalizado dicho plazo, los datos serán suprimidos o anonimizados.</p>
        </section>

        <section>
          <h2 className="text-[#0f1f3d] font-bold text-xl mb-3 font-playfair">
            5. Tus derechos
          </h2>
          <p>En virtud del RGPD y la LOPDGDD, puedes ejercer los siguientes derechos enviando un email a <strong>monica@luxhomein.com</strong> con tu nombre y copia de tu DNI:</p>
          <ul className="mt-3 space-y-1.5 list-disc list-inside">
            <li><strong>Acceso:</strong> conocer qué datos tenemos sobre ti.</li>
            <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
            <li><strong>Supresión:</strong> solicitar que eliminemos tus datos.</li>
            <li><strong>Oposición:</strong> oponerte al tratamiento en determinadas circunstancias.</li>
            <li><strong>Limitación:</strong> solicitar que restrinjamos el tratamiento.</li>
            <li><strong>Portabilidad:</strong> recibir tus datos en formato estructurado.</li>
          </ul>
          <p className="mt-3">Si consideras que el tratamiento no es conforme, tienes derecho a presentar una reclamación ante la <strong>Agencia Española de Protección de Datos</strong> (www.aepd.es).</p>
        </section>

        <section>
          <h2 className="text-[#0f1f3d] font-bold text-xl mb-3 font-playfair">
            6. Seguridad
          </h2>
          <p>Aplicamos medidas técnicas y organizativas adecuadas para proteger tus datos frente a accesos no autorizados, pérdida o destrucción, conforme al artículo 32 del RGPD.</p>
        </section>

        <p className="text-xs text-gray-400 border-t border-gray-200 pt-6">
          Última actualización: abril de 2026
        </p>
      </div>
    </div>
  );
}
