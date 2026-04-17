/**
 * Cliente HTTP para la API REST v1 de Inmovilla
 *
 * Base URL : https://procesos.inmovilla.com/api/v1
 * Auth     : cabecera  Token: {INMOVILLA_TOKEN}
 * Límite   : 10 req/min · 50 req/10 min  (propiedades)
 *
 * Responsabilidades de este módulo:
 *  1. Llamadas HTTP a la API real
 *  2. Mapeo de campos en bruto → InmovillaProperty (formato interno)
 *
 * Si Inmovilla cambia nombres de campo, solo hay que tocar este archivo.
 */

import type { InmovillaProperty } from './adapter';

const BASE_URL = 'https://procesos.inmovilla.com/api/v1';

function authHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Token: process.env.INMOVILLA_TOKEN!,
  };
}

// ─── Tipos de respuesta de la API ─────────────────────────────────────────────

/** Item devuelto por GET /propiedades/?listado */
export interface InmovillaListItem {
  cod_ofer: number;
  ref:       string;
  /** 0 = disponible, 1 = no disponible */
  nodisponible: 0 | 1;
  /** ISO date – última actualización en Inmovilla */
  fechaact: string;
}

/** Foto en la respuesta de la API (distintos formatos posibles) */
interface RawFoto {
  url:         string;
  description?: string;
  order?:       number;
}

/** Propiedad completa devuelta por GET /propiedades/?cod_ofer={id} */
export interface InmovillaApiProperty {
  cod_ofer:    number;
  ref:         string;
  nodisponible: 0 | 1;
  /** 0=disponible, 1=reservado */
  estadoficha?: number;
  /** 1=venta, 2=alquiler */
  keyacci:     number;
  /** Código de tipo de inmueble (ver mapPropertyType) */
  key_tipo:    number;

  // Precios
  precio?:      number;
  precioinmo?:  number;
  precioalq?:   number;

  // Destacado / obra nueva (0|1 o boolean según versión)
  destacado?:  0 | 1 | boolean;
  obra_nueva?: 0 | 1 | boolean;

  // Títulos y descripciones
  tituloes?:            string;
  tituloca?:            string;
  tituloen?:            string;
  descripcion?:         string;
  descripcioncatalan?:  string;
  descripcioningles?:   string;

  // Unidades y superficies
  habitaciones?: number;
  habdobles?:    number;
  banyos?:       number;
  aseos?:        number;
  m_cons?:       number;   // superficie construida
  m_utiles?:     number;
  m_parcela?:    number;
  m_terraza?:    number;
  planta?:       number;

  // Características booleanas
  ascensor?:    0 | 1 | boolean;
  piscina_prop?: 0 | 1 | boolean;
  piscina_com?:  0 | 1 | boolean;
  terraza?:     0 | 1 | boolean;
  jardin?:      0 | 1 | boolean;
  aire_con?:    0 | 1 | boolean;
  airecentral?: 0 | 1 | boolean;
  trastero?:    0 | 1 | boolean;
  parking?:     0 | 1 | boolean;
  plaza_gara?:  number;
  /** Código calefacción: 0 = sin calefacción */
  keycalefa?:   number;

  // Ubicación
  calle?:     string;
  numero?:    string;
  cp?:        string;
  localidad?: string;
  provincia?: string;
  latitud?:   number;
  longitud?:  number;

  // Certificado energético
  energialetra?:   string;
  emisionesletra?: string;

  /** Código de orientación (1=N, 2=S, 3=E, 4=O, 5=NE, 6=NO, 7=SE, 8=SO) */
  keyori?: number;

  // Fechas
  fecha?:    string;
  fechaact?: string;

  /**
   * Fotos: la API puede devolver un objeto { a: RawFoto, b: RawFoto, … }
   * o un array de RawFoto.  El cliente normaliza ambos formatos.
   */
  fotos?: Record<string, RawFoto | string> | RawFoto[];
}

// ─── Helpers de mapeo ────────────────────────────────────────────────────────

function asBool(val: 0 | 1 | boolean | undefined | null): boolean {
  return Boolean(val);
}

/**
 * Mapea el código numérico key_tipo de Inmovilla a nuestros tipos internos.
 * Ajustar si Inmovilla asigna otros códigos en la cuenta concreta.
 */
function mapPropertyType(key_tipo: number): string {
  const map: Record<number, string> = {
    1:  'piso',      // Piso
    2:  'piso',      // Apartamento
    3:  'chalet',    // Chalet adosado
    4:  'chalet',    // Chalet pareado
    5:  'chalet',    // Chalet independiente
    6:  'casa',      // Villa
    7:  'atico',     // Ático
    8:  'piso',      // Dúplex
    9:  'piso',      // Estudio
    10: 'casa',      // Casa
    11: 'casa',      // Masía / Casa rural
    12: 'local',     // Local comercial
    13: 'local',     // Oficina
    14: 'local',     // Nave industrial
    15: 'garaje',    // Garaje / Parking
    16: 'terreno',   // Terreno / Solar
    17: 'terreno',   // Finca rústica
  };
  return map[key_tipo] ?? 'piso';
}

function mapStatus(
  nodisponible: 0 | 1,
  estadoficha: number | undefined,
  keyacci: number,
): string {
  if (nodisponible === 1) {
    return keyacci === 2 ? 'alquilado' : 'vendido';
  }
  if (estadoficha === 1) return 'reservado';
  return 'disponible';
}

function mapOrientation(keyori: number | undefined): string | undefined {
  if (!keyori) return undefined;
  const map: Record<number, string> = {
    1: 'Norte', 2: 'Sur',    3: 'Este',   4: 'Oeste',
    5: 'Noreste', 6: 'Noroeste', 7: 'Sureste', 8: 'Suroeste',
  };
  return map[keyori];
}

function extractPhotos(
  fotos: InmovillaApiProperty['fotos'],
): InmovillaProperty['imagenes'] {
  if (!fotos) return [];

  // Formato array
  if (Array.isArray(fotos)) {
    return fotos
      .filter((f) => f && (typeof f === 'string' ? f : f.url))
      .map((f, i) => ({
        url:        typeof f === 'string' ? f : f.url,
        descripcion: typeof f === 'string' ? '' : (f.description ?? ''),
        principal:  i === 0,
        orden:      typeof f === 'string' ? i : (f.order ?? i),
      }));
  }

  // Formato objeto { a: RawFoto|string, b: … }
  return Object.entries(fotos)
    .filter(([, val]) => val && (typeof val === 'string' ? val : val.url))
    .map(([key, val], i) => ({
      url:        typeof val === 'string' ? val : val.url,
      descripcion: typeof val === 'string' ? '' : (val.description ?? ''),
      principal:  key === 'a' || i === 0,
      orden:      i,
    }));
}

// ─── Conversión API bruta → InmovillaProperty (formato interno) ───────────────

function toNormalized(raw: InmovillaApiProperty): InmovillaProperty {
  const price =
    raw.keyacci === 2
      ? (raw.precioalq ?? raw.precio ?? 0)
      : (raw.precioinmo ?? raw.precio ?? 0);

  const area = raw.m_cons ?? raw.m_utiles ?? 0;

  return {
    id:               raw.cod_ofer,
    referencia:       raw.ref,
    titulo:           raw.tituloes ?? `Propiedad ${raw.cod_ofer}`,
    descripcion:      raw.descripcion ?? '',
    tipo_inmueble:    mapPropertyType(raw.key_tipo),
    tipo_operacion:   raw.keyacci === 2 ? 'alquiler' : 'venta',
    estado:           mapStatus(raw.nodisponible, raw.estadoficha, raw.keyacci),
    precio:           price,
    precio_m2:        area > 0 ? Math.round(price / area) : undefined,
    destacado:        asBool(raw.destacado),
    obra_nueva:       asBool(raw.obra_nueva),
    fecha_publicacion: raw.fecha ?? raw.fechaact ?? new Date().toISOString(),
    habitaciones:     raw.habitaciones ?? 0,
    banos:            (raw.banyos ?? 0) + (raw.aseos ?? 0),
    superficie:       area,
    superficie_parcela: raw.m_parcela,
    planta:           raw.planta,
    garaje:           asBool(raw.parking) || (raw.plaza_gara != null && raw.plaza_gara > 0),
    piscina:          asBool(raw.piscina_prop) || asBool(raw.piscina_com),
    terraza:          asBool(raw.terraza),
    jardin:           asBool(raw.jardin),
    ascensor:         asBool(raw.ascensor),
    aire_acondicionado: asBool(raw.aire_con) || asBool(raw.airecentral),
    calefaccion:      raw.keycalefa != null && raw.keycalefa > 0,
    trastero:         asBool(raw.trastero),
    orientacion:      mapOrientation(raw.keyori),
    certificado_energetico: raw.energialetra,
    direccion:        [raw.calle, raw.numero].filter(Boolean).join(' '),
    municipio:        raw.localidad ?? '',
    provincia:        raw.provincia ?? '',
    codigo_postal:    raw.cp ?? '',
    barrio:           undefined,
    latitud:          raw.latitud,
    longitud:         raw.longitud,
    imagenes:         extractPhotos(raw.fotos),
  };
}

// ─── Funciones públicas ───────────────────────────────────────────────────────

/**
 * Devuelve la lista completa de propiedades (campos mínimos).
 * Útil para saber qué IDs existen y cuáles han cambiado desde la última sync.
 */
export async function fetchPropertyList(): Promise<InmovillaListItem[]> {
  const res = await fetch(`${BASE_URL}/propiedades/?listado`, {
    headers: authHeaders(),
    cache:   'no-store',
  });
  if (!res.ok) {
    throw new Error(`Inmovilla /propiedades/?listado → ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/**
 * Obtiene el detalle completo de una propiedad y lo convierte al formato interno.
 * Devuelve null si la API responde con error (propiedad eliminada, acceso denegado…).
 */
export async function fetchProperty(codOfer: number): Promise<InmovillaProperty | null> {
  const res = await fetch(`${BASE_URL}/propiedades/?cod_ofer=${codOfer}`, {
    headers: authHeaders(),
    cache:   'no-store',
  });
  if (!res.ok) return null;
  const raw: InmovillaApiProperty = await res.json();
  return toNormalized(raw);
}
