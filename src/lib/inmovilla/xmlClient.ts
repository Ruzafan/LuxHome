/**
 * Cliente XML para el feed diario de Inmovilla
 *
 * URL del feed (configura en .env):
 *   Demo/test : INMOVILLA_XML_URL=https://procesos.inmovilla.com/xml/xml2demo/{numagencia}-web.xml
 *   Producción: INMOVILLA_XML_URL=https://procesos.inmovilla.com/xml/xml2/{numagencia}-web.xml
 *
 * El XML se regenera cada noche → los cambios en Inmovilla tardan hasta 24 h.
 * Ventajas frente a la API REST: sin autenticación extra, sin rate limits,
 * un solo request para todas las propiedades.
 */

import { XMLParser } from 'fast-xml-parser';
import type { InmovillaProperty } from './adapter';

// ─── Tipos del XML ─────────────────────────────────────────────────────────────

interface XmlProperty {
  id:           number;
  numagencia:   number;
  ref?:         string | number;
  destacado?:   number;
  keypromo?:    number;
  tipo_ofer?:   string;
  accion?:      string;
  // Precios
  precioinmo?:  number;
  precioalq?:   number;
  // Título y descripción (idioma 1 = español)
  titulo1?:     string;
  descrip1?:    string;
  // Superficies y habitaciones
  habitaciones?: number;
  habdobles?:   number;
  banyos?:      number;
  aseos?:       number;
  m_cons?:      number;
  m_parcela?:   number;
  m_uties?:     number;
  m_terraza?:   number;
  numplanta?:   number;
  orientacion?: string;
  // Amenidades booleanas (0 | 1)
  ascensor?:    number;
  piscina_prop?: number;
  piscina_com?: number;
  terraza?:     number;
  patio?:       number;
  jardin?:      number;   // puede aparecer como "jardin" o "jardín" según versión
  aire_con?:    number;
  airecentral?: number;
  calefaccion?: number;
  calefacentral?: number;
  trastero?:    number;
  parking?:     number;
  plaza_gara?:  number;
  // Certificado energético
  energialetra?: string;
  // Ubicación
  ciudad?:  string;
  cp?:      string;
  zona?:    string;
  /**
   * ATENCIÓN: en el XML de Inmovilla el campo se llama "altitud" pero contiene
   * la longitud geográfica (eje X), no la altitud. Es un error histórico del
   * esquema que Inmovilla no ha corregido.
   */
  latitud?:  number;
  altitud?:  number;   // = longitud
  // Fotos
  numfotos?: number;
  // foto1 … foto19 — accedemos dinámicamente con p[`foto${i}`]
  [key: string]: unknown;
}

interface XmlRoot {
  propiedades: {
    propiedad: XmlProperty | XmlProperty[];
  };
}

// ─── Helpers de mapeo ────────────────────────────────────────────────────────

function mapPropertyType(tipo_ofer: string): string {
  // Normaliza: minúsculas + elimina diacríticos (á→a, etc.)
  const s = tipo_ofer.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
  if (s.includes('atico'))                                                      return 'atico';
  if (s.includes('adosado') || s.includes('pareado') ||
      s.includes('chalet')  || s.includes('villa')   || s.includes('bungalow')) return 'chalet';
  if (s.includes('piso')    || s.includes('apartamento') || s.includes('loft') ||
      s.includes('estudio') || s.includes('triplex')  || s.includes('duplex')  ||
      s.includes('planta baja'))                                                return 'piso';
  if (s.includes('casa')    || s.includes('cortijo')  || s.includes('masia')   ||
      s.includes('finca')   || s.includes('rustico')  || s.includes('pueblo'))  return 'casa';
  if (s.includes('local')   || s.includes('oficina')  || s.includes('nave'))   return 'local';
  if (s.includes('garaje')  || s.includes('parking'))                           return 'garaje';
  if (s.includes('terreno') || s.includes('solar'))                             return 'terreno';
  return 'piso'; // fallback razonable
}

function mapOperation(accion: string): 'venta' | 'alquiler' {
  return accion.toLowerCase().includes('alquil') && !accion.toLowerCase().includes('vender')
    ? 'alquiler'
    : 'venta';
}

function asNum(val: unknown): number {
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

function asBool(val: unknown): boolean {
  return Number(val) === 1;
}

function extractPhotos(p: XmlProperty): InmovillaProperty['imagenes'] {
  const count = Math.min(asNum(p.numfotos), 36);
  const photos: InmovillaProperty['imagenes'] = [];
  for (let i = 1; i <= count; i++) {
    const raw = p[`foto${i}`];
    // Con fast-xml-parser y atributos, un elemento con attr da un objeto;
    // sin attr da string directamente.
    const url =
      typeof raw === 'string' ? raw
      : (raw && typeof raw === 'object' && '#text' in raw) ? String((raw as Record<string, unknown>)['#text'])
      : undefined;
    if (url) {
      photos.push({ url, descripcion: '', principal: i === 1, orden: i - 1 });
    }
  }
  return photos;
}

function toInmovillaProperty(p: XmlProperty): InmovillaProperty {
  const operation = mapOperation(p.accion ?? 'Vender');
  const price =
    operation === 'alquiler'
      ? asNum(p.precioalq ?? p.precioinmo)
      : asNum(p.precioinmo ?? p.precioalq);
  const area = asNum(p.m_cons ?? p.m_uties);

  // El XML solo incluye propiedades activas; las vendidas/alquiladas se eliminan del feed.
  return {
    id:               p.id,
    referencia:       String(p.ref ?? p.id),
    titulo:           String(p.titulo1 ?? `Propiedad ${p.id}`).trim(),
    descripcion:      String(p.descrip1 ?? '').trim(),
    tipo_inmueble:    mapPropertyType(p.tipo_ofer ?? 'Piso'),
    tipo_operacion:   operation,
    estado:           'disponible',
    precio:           price,
    precio_m2:        area > 0 && price > 0 ? Math.round(price / area) : undefined,
    destacado:        asBool(p.destacado),
    obra_nueva:       asBool(p.keypromo),
    fecha_publicacion: new Date().toISOString(),
    habitaciones:     asNum(p.habitaciones),
    banos:            asNum(p.banyos) + asNum(p.aseos),
    superficie:       area,
    superficie_parcela: p.m_parcela ? asNum(p.m_parcela) : undefined,
    planta:           p.numplanta != null ? asNum(p.numplanta) : undefined,
    garaje:           asBool(p.parking) || asNum(p.plaza_gara) > 0,
    piscina:          asBool(p.piscina_prop) || asBool(p.piscina_com),
    terraza:          asBool(p.terraza),
    jardin:           asBool(p.jardin) || asBool(p.patio),
    ascensor:         asBool(p.ascensor),
    aire_acondicionado: asBool(p.aire_con) || asBool(p.airecentral),
    calefaccion:      asBool(p.calefaccion) || asBool(p.calefacentral),
    trastero:         asBool(p.trastero),
    orientacion:      p.orientacion || undefined,
    certificado_energetico: p.energialetra || undefined,
    direccion:        p.zona ?? '',
    municipio:        p.ciudad ?? '',
    provincia:        '',   // el XML no incluye provincia explícita
    codigo_postal:    String(p.cp ?? ''),
    barrio:           p.zona,
    latitud:          p.latitud   != null ? Number(p.latitud)  : undefined,
    longitud:         p.altitud   != null ? Number(p.altitud)  : undefined, // ojo: "altitud" = longitud
    imagenes:         extractPhotos(p),
  };
}

// ─── Funciones públicas ───────────────────────────────────────────────────────

const PARSER_OPTIONS = {
  ignoreAttributes:    false,
  attributeNamePrefix: '@_',
  textNodeName:        '#text',
  parseAttributeValue: true,
  parseTagValue:       true,
};

/**
 * Parsea el contenido XML de Inmovilla (string) y devuelve las propiedades
 * en formato interno. Útil para procesar ficheros subidos manualmente.
 */
export function parseXmlProperties(xml: string): InmovillaProperty[] {
  const parser = new XMLParser(PARSER_OPTIONS);
  const result: XmlRoot = parser.parse(xml);
  const raw = result?.propiedades?.propiedad;
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : [raw];
  return list.map(toInmovillaProperty);
}

/**
 * Descarga el feed XML de Inmovilla desde INMOVILLA_XML_URL y lo parsea.
 * Útil para el cron nocturno y la sync manual desde el panel.
 *
 * @throws si INMOVILLA_XML_URL no está definida o la descarga falla.
 */
export async function fetchXmlProperties(): Promise<InmovillaProperty[]> {
  const url = process.env.INMOVILLA_XML_URL;
  if (!url) throw new Error('INMOVILLA_XML_URL no está definida en .env');

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Error descargando XML: ${res.status} ${res.statusText}`);
  }

  return parseXmlProperties(await res.text());
}
