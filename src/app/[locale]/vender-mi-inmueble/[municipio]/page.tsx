import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getAlternates } from '@/lib/seo';
import { getMunicipalityMarket } from '@/lib/propertyService';
import { SELL_MUNICIPALITIES, getSellMunicipality } from '@/data/sellZones';
import PageHeader from '@/components/layout/PageHeader';
import PropertyCard from '@/components/properties/PropertyCard';
import ScrollRevealInit from '@/components/ui/ScrollRevealInit';
import ValuationSection from '@/components/sell/ValuationSection';
import SellProcess from '@/components/sell/SellProcess';
import SellFaq, { type FaqItem } from '@/components/sell/SellFaq';
import SellZonesLinks from '@/components/sell/SellZonesLinks';

// Páginas estáticas que se regeneran cada 12 h con los datos de la cartera
export const revalidate = 43200;
export const dynamicParams = false;

interface Props {
  params: Promise<{ locale: string; municipio: string }>;
}

export function generateStaticParams() {
  return SELL_MUNICIPALITIES.map((m) => ({ municipio: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { municipio } = await params;
  const m = getSellMunicipality(municipio);
  if (!m) return {};
  const title = `Vender piso en ${m.name} | Valoración gratuita`;
  const description = `¿Quieres vender tu piso o casa en ${m.name}? Pide una valoración gratuita de tu vivienda y vende con un equipo que conoce el ${m.comarca.name}: precio realista, compradores filtrados y acompañamiento hasta notaría.`;
  const path = `/vender-mi-inmueble/${m.slug}`;
  return {
    title,
    description,
    alternates: getAlternates(path),
    openGraph: { title, description, url: `https://luxhomein.com${path}` },
  };
}

const eurM2 = (n: number) => `${new Intl.NumberFormat('es-ES').format(n)} €/m²`;

export default async function SellMunicipalityPage({ params }: Props) {
  const { municipio } = await params;
  const m = getSellMunicipality(municipio);
  if (!m) notFound();

  const [market, t] = await Promise.all([getMunicipalityMarket(m.name), getTranslations('sell')]);
  // La pregunta general de documentación se sustituye por la versión detallada de abajo
  const baseFaq = (t.raw('faq.items') as FaqItem[]).filter((f) => !/documentaci/i.test(f.question));
  const path = `/vender-mi-inmueble/${m.slug}`;

  const faq: FaqItem[] = [
    {
      question: `¿Cuánto vale mi piso en ${m.name}?`,
      answer: `Depende de la superficie, el estado, la altura y la calle. Déjanos los datos en el formulario de esta página y un asesor te contactará para hacerte una valoración precisa con ventas reales de ${m.name} y del ${m.comarca.name}, gratis y sin compromiso.`,
    },
    {
      question: `¿Cuánto se tarda en vender una vivienda en ${m.name}?`,
      answer:
        'El plazo depende sobre todo de que el precio de salida esté ajustado al mercado y de cómo se presenta el inmueble. En la valoración te damos una estimación realista del plazo para tu caso concreto.',
    },
    {
      question: '¿Qué documentos necesito para vender?',
      answer:
        'Escrituras o nota simple, último recibo del IBI, certificado de eficiencia energética, cédula de habitabilidad vigente y certificado de estar al corriente con la comunidad. Te ayudamos a conseguir lo que falte.',
    },
    ...baseFaq,
  ];

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Venta de inmuebles en ${m.name}`,
    serviceType: 'Valoración y venta de inmuebles',
    areaServed: { '@type': 'City', name: m.name, containedInPlace: { '@type': 'AdministrativeArea', name: m.comarca.name } },
    provider: {
      '@type': 'RealEstateAgent',
      name: 'LuxHome Inmobiliaria',
      url: 'https://luxhomein.com',
      telephone: '+34691294443',
    },
    url: `https://luxhomein.com${path}`,
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://luxhomein.com' },
      { '@type': 'ListItem', position: 2, name: 'Vender mi inmueble', item: 'https://luxhomein.com/vender-mi-inmueble' },
      { '@type': 'ListItem', position: 3, name: m.name, item: `https://luxhomein.com${path}` },
    ],
  };

  const stats = [
    market.forSale > 0 && { value: String(market.forSale), label: `inmuebles en venta con LuxHome en ${m.name}` },
    market.medianPricePerM2 && { value: eurM2(market.medianPricePerM2), label: 'precio medio de salida de nuestra cartera' },
    market.soldOrReserved > 0 && { value: String(market.soldOrReserved), label: 'vendidos o reservados recientemente' },
  ].filter(Boolean) as { value: string; label: string }[];

  const showcase = market.properties.slice(0, 3);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <ScrollRevealInit />

      <PageHeader
        eyebrow={
          <>
            <Link href="/vender-mi-inmueble" className="underline-offset-2 hover:underline">Vender mi inmueble</Link>
            {' · '}
            {m.comarca.name}
          </>
        }
        title={`Vende tu piso en ${m.name}`}
        subtitle={`Te decimos cuánto vale tu vivienda con datos reales de ${m.name} y te acompañamos hasta la firma ante notario.`}
      >
        <Link href="#valoracion" className="btn btn-rose mt-9">
          Valorar mi vivienda gratis
        </Link>
      </PageHeader>

      {stats.length > 0 && (
        <section className="container-lux pt-16 md:pt-20">
          <dl className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label} className="reveal">
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="font-figures block text-[36px] font-light leading-none">{s.value}</span>
                  <span className="mt-2 block max-w-[28ch] text-[14px] text-[var(--mid)]">{s.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <div className="pt-16 md:pt-20">
        <ValuationSection
          title={`¿Cuánto vale tu vivienda en ${m.name}?`}
          text={`Responde tres preguntas y un asesor te contactará para valorar tu vivienda con datos reales de la zona, gratis y sin compromiso.`}
          defaultCity={m.name}
        />
      </div>

      {showcase.length > 0 && (
        <section className="container-lux py-20 md:py-28">
          <h2
            className="reveal font-display mb-10 max-w-[20ch] font-light leading-[1.06]"
            style={{ fontSize: 'clamp(32px, 3.6vw, 48px)', letterSpacing: '-0.015em' }}
          >
            Inmuebles que gestionamos en {m.name}
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {showcase.map((p) => (
              <div key={p.id} className="reveal">
                <PropertyCard property={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      <div className={showcase.length > 0 ? '' : 'pt-20 md:pt-28'}>
        <SellProcess title={`Así vendemos tu inmueble en ${m.name}`} />
      </div>

      <SellFaq title={`Vender en ${m.name}: preguntas frecuentes`} items={faq} />

      <SellZonesLinks title={`Otros municipios del ${m.comarca.name}`} currentSlug={m.slug} onlyComarcaId={m.comarca.id} />
    </>
  );
}
