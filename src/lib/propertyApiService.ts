/**
 * Servicio de propiedades — fuente de datos: Inmovilla API web (tiempo real)
 *
 * Reemplaza propertyService.ts (DB). Mismas firmas públicas para que
 * los componentes no necesiten cambios, salvo el import.
 *
 * ID de propiedad = String(cod_ofer)  ← ya no es UUID de BD
 */

import { inmovillaClient } from './inmovilla/apiwebClient';
import type { PaginacionItem, FichaItem } from './inmovilla/apiwebClient';
import type {
  Property,
  PropertyFilters,
  PropertySearchResult,
  PropertyType,
  OperationType,
} from '@/types/property';
import { normalize } from '@/lib/utils';

type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'newest';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function asNum(v: unknown): number {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

function asBool(v: unknown): boolean {
  return Number(v) === 1;
}

function mapPropertyType(nbtipo: string): PropertyType {
  const s = nbtipo.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
  if (s.includes('atico'))                                                       return 'atico';
  if (s.includes('adosado') || s.includes('pareado') ||
      s.includes('chalet')  || s.includes('villa')   || s.includes('bungalow')) return 'chalet';
  if (s.includes('piso')    || s.includes('apartamento') || s.includes('loft') ||
      s.includes('estudio') || s.includes('triplex')  || s.includes('duplex')  ||
      s.includes('planta baja'))                                                 return 'piso';
  if (s.includes('casa')    || s.includes('cortijo')  || s.includes('masia')   ||
      s.includes('finca')   || s.includes('rustico')  || s.includes('pueblo'))  return 'casa';
  if (s.includes('local')   || s.includes('oficina')  || s.includes('nave'))    return 'local';
  if (s.includes('garaje')  || s.includes('parking'))                            return 'garaje';
  if (s.includes('terreno') || s.includes('solar'))                              return 'terreno';
  return 'piso';
}

function mapOperation(keyacci: number): OperationType {
  return keyacci === 2 ? 'alquiler' : 'venta';
}

// ─── Filters → API WHERE / ORDER ─────────────────────────────────────────────

function buildQuery(filters: PropertyFilters, sort: SortOption) {
  const conds: string[] = [];

  if (filters.operation) {
    conds.push(`keyacci=${filters.operation === 'alquiler' ? 2 : 1}`);
  }

  // Precio: campo depende de la operación
  const priceField = filters.operation === 'alquiler' ? 'precioalq' : 'precioinmo';
  if (filters.minPrice !== undefined) conds.push(`${priceField} >= ${filters.minPrice}`);
  if (filters.maxPrice !== undefined) conds.push(`${priceField} <= ${filters.maxPrice}`);

  if (filters.minBedrooms !== undefined) conds.push(`total_hab >= ${filters.minBedrooms}`);
  if (filters.hasGarage)  conds.push('parking=1');
  if (filters.hasPool)    conds.push('(piscina_prop=1 OR piscina_com=1)');
  if (filters.hasTerrace) conds.push('m_terraza > 0');

  // Ciudad: en el WHERE de la API (exacto) para que el total sea correcto
  if (filters.city) {
    // Escapamos comillas simples para evitar inyección en la cadena SQL de Inmovilla
    const safeCity = filters.city.replace(/'/g, "''");
    conds.push(`ciudad='${safeCity}'`);
  }

  const where = conds.join(' AND ');
  const orden =
    sort === 'price_asc'  ? 'precioinmo ASC' :
    sort === 'price_desc' ? 'precioinmo DESC' :
    sort === 'newest'     ? 'fechaact DESC' :
    'destacado DESC, fechaact DESC';

  return { where, orden };
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function paginacionToProperty(item: PaginacionItem, featured = false): Property {
  const operation = mapOperation(item.keyacci);
  const price =
    operation === 'alquiler'
      ? asNum(item.precioalq) || asNum(item.precioinmo)
      : asNum(item.precioinmo) || asNum(item.precioalq);
  const area = asNum(item.m_cons) || asNum(item.m_uties);
  const type = mapPropertyType(item.nbtipo ?? '');

  const title =
    [item.nbtipo, item.zona && `en ${item.zona}`, item.ciudad]
      .filter(Boolean).join(' ').trim() ||
    `Propiedad ${item.cod_ofer}`;

  const foto = item.foto ? String(item.foto) : undefined;

  return {
    id:               String(item.cod_ofer),
    reference:        item.ref ?? String(item.cod_ofer),
    title,
    description:      '',
    type,
    operation,
    status:           'disponible',
    price,
    pricePerM2:       area > 0 && price > 0 ? Math.round(price / area) : undefined,
    isFeatured:       featured,
    isNewDevelopment: false,
    publishedAt:      String(item.fechaact ?? new Date().toISOString()),
    updatedAt:        String(item.fechaact ?? new Date().toISOString()),
    features: {
      bedrooms:           asNum(item.total_hab) || asNum(item.habitaciones),
      bathrooms:          asNum(item.banyos) + asNum(item.aseos),
      area,
      plotArea:           item.m_parcela ? asNum(item.m_parcela) : undefined,
      floor:              undefined,
      hasGarage:          asBool(item.parking),
      hasPool:            asBool(item.piscina_prop) || asBool(item.piscina_com),
      hasTerrace:         asNum(item.m_terraza) > 0,
      hasGarden:          false,
      hasElevator:        asBool(item.ascensor),
      hasAirConditioning: asBool(item.aire_con),
      hasHeating:         asBool(item.calefaccion),
      hasStorageRoom:     false,
      orientation:        undefined,
      energyCertificate:  undefined,
    },
    location: {
      address:      item.zona ?? '',
      city:         item.ciudad ?? '',
      province:     '',
      postalCode:   '',
      neighborhood: item.zona !== item.ciudad ? (item.zona || undefined) : undefined,
      lat:          undefined,
      lng:          undefined,
    },
    images: foto
      ? [{ id: '1', url: foto, alt: title, isPrimary: true }]
      : [],
  };
}

interface FichaResponse {
  ficha?:         Record<string | number, FichaItem>;
  fotos?:         Record<string, string[]>;
  descripciones?: Record<string, Record<string, { titulo?: string; descrip?: string }>>;
  [key: string]:  unknown;
}

function fichaToProperty(resp: FichaResponse, codOfer: string): Property | null {
  const fichaData = resp.ficha;
  if (!fichaData) return null;

  // La API devuelve el item en la clave "1" (primer resultado)
  const item = (fichaData[1] ?? fichaData[0]) as (FichaItem & Record<string, unknown>) | undefined;
  if (!item) return null;

  const langData = resp.descripciones?.[codOfer]?.['1'];
  const titulo   = langData?.titulo?.trim() || String(item.nbtipo ?? '') || `Propiedad ${codOfer}`;
  const descrip  = langData?.descrip?.trim() ?? '';

  const operation = mapOperation(item.keyacci);
  const price =
    operation === 'alquiler'
      ? asNum(item.precioalq) || asNum(item.precioinmo)
      : asNum(item.precioinmo) || asNum(item.precioalq);
  const area = asNum(item.m_cons) || asNum(item.m_uties);
  const type = mapPropertyType(String(item.nbtipo ?? ''));

  // Fotos: array en fotos[cod_ofer], o fallback al campo foto de ficha
  const photoUrls: string[] = resp.fotos?.[codOfer] ?? [];
  const images =
    photoUrls.length > 0
      ? photoUrls.map((url, i) => ({ id: String(i + 1), url, alt: titulo, isPrimary: i === 0 }))
      : item.foto
        ? [{ id: '1', url: String(item.foto), alt: titulo, isPrimary: true }]
        : [];

  return {
    id:               codOfer,
    reference:        item.ref ?? codOfer,
    title:            titulo,
    description:      descrip,
    type,
    operation,
    status:           'disponible',
    price,
    pricePerM2:       area > 0 && price > 0 ? Math.round(price / area) : undefined,
    isFeatured:       asBool(item.destacado),
    isNewDevelopment: asBool(item.keypromo),
    publishedAt:      String(item.fechaact ?? new Date().toISOString()),
    updatedAt:        String(item.fechaact ?? new Date().toISOString()),
    features: {
      bedrooms:           asNum(item.total_hab) || asNum(item.habitaciones),
      bathrooms:          asNum(item.banyos) + asNum(item.aseos),
      area,
      plotArea:           item.m_parcela ? asNum(item.m_parcela) : undefined,
      floor:              item.numplanta != null ? asNum(item.numplanta) : undefined,
      hasGarage:          asBool(item.parking) || asNum(item.plaza_gara) > 0,
      hasPool:            asBool(item.piscina_prop) || asBool(item.piscina_com),
      hasTerrace:         asBool(item.terraza) || asNum(item.m_terraza) > 0,
      hasGarden:          asBool(item.jardin) || asBool(item.patio),
      hasElevator:        asBool(item.ascensor),
      hasAirConditioning: asBool(item.aire_con) || asBool(item.airecentral),
      hasHeating:         asBool(item.calefaccion) || asBool(item.calefacentral),
      hasStorageRoom:     asBool(item.trastero),
      orientation:        item.orientacion ? String(item.orientacion) : undefined,
      energyCertificate:  item.energialetra || undefined,
    },
    location: {
      address:      String(item.zona ?? ''),
      city:         String(item.ciudad ?? ''),
      province:     '',
      postalCode:   String(item.cp ?? ''),
      neighborhood: String(item.zona ?? '') || undefined,
      lat:          item.latitud  != null ? Number(item.latitud)  : undefined,
      lng:          item.altitud  != null ? Number(item.altitud)  : undefined, // "altitud" = longitud en Inmovilla
    },
    images,
  };
}

// ─── Helpers de lectura de la respuesta paginada ──────────────────────────────
//
// La API devuelve bloques con esta estructura:
//   [0] → { posicion, elementos, total }   ← metadatos
//   [1..elementos] → items                 ← 1-indexed
//
type RawBlock  = Record<number, unknown>;
interface BlockMeta { posicion: number; elementos: number; total: number }

function getMeta(block: RawBlock): BlockMeta {
  return (block[0] ?? { posicion: 0, elementos: 0, total: 0 }) as BlockMeta;
}

function extractItems(block: RawBlock): PaginacionItem[] {
  const { elementos } = getMeta(block);
  const items: PaginacionItem[] = [];
  for (let i = 1; i <= elementos; i++) {
    const item = block[i];
    if (item && typeof item === 'object' && 'cod_ofer' in item) {
      items.push(item as PaginacionItem);
    }
  }
  return items;
}

// ─── API pública ──────────────────────────────────────────────────────────────

export async function getProperties(
  filters: PropertyFilters = {},
  page = 1,
  pageSize = 9,
  sort: SortOption = 'relevance',
): Promise<PropertySearchResult> {
  const { where, orden } = buildQuery(filters, sort);
  const pos = (page - 1) * pageSize + 1;

  const resp = await inmovillaClient.query()
    .paginacion(pos, pageSize, where, orden)
    .fetch();

  const pag = resp.paginacion as RawBlock | undefined;
  if (!pag) {
    return { properties: [], total: 0, page, pageSize, totalPages: 0 };
  }

  const { total } = getMeta(pag);
  let properties = extractItems(pag).map((item) => paginacionToProperty(item));

  // Filtro de tipo: post-fetch (no hay WHERE directo por tipo_key en la API)
  if (filters.type) {
    properties = properties.filter((p) => p.type === filters.type);
  }

  return {
    properties,
    total: filters.type ? properties.length : total,
    page,
    pageSize,
    totalPages: filters.type
      ? Math.ceil(properties.length / pageSize)
      : Math.ceil(total / pageSize),
  };
}

export async function getPropertyById(id: string): Promise<Property | null> {
  const resp = await inmovillaClient.query()
    .ficha(`ofertas.cod_ofer=${id}`)
    .fetch();

  return fichaToProperty(resp as FichaResponse, id);
}

export async function getFeaturedProperties(limit = 4): Promise<Property[]> {
  const resp = await inmovillaClient.query()
    .destacados(1, limit)
    .fetch();

  const dest = resp.destacados as RawBlock | undefined;
  if (!dest) return [];

  return extractItems(dest).map((item) => paginacionToProperty(item, true));
}

export async function getRelatedProperties(property: Property, limit = 3): Promise<Property[]> {
  const keyacci = property.operation === 'alquiler' ? 2 : 1;
  const where   = `keyacci=${keyacci}`;

  const resp = await inmovillaClient.query()
    .paginacion(1, limit + 5, where, 'destacado DESC, fechaact DESC')
    .fetch();

  const pag = resp.paginacion as RawBlock | undefined;
  if (!pag) return [];

  return extractItems(pag)
    .filter((item) => String(item.cod_ofer) !== property.id)
    .slice(0, limit)
    .map((item) => paginacionToProperty(item));
}

export async function getAllLocations(): Promise<string[]> {
  const resp = await inmovillaClient.query().ciudades(1, 500).fetch();
  const block = resp.ciudades as RawBlock | undefined;
  if (!block) return [];

  const { elementos } = getMeta(block);
  const seen   = new Set<string>();
  const result: string[] = [];

  for (let i = 1; i <= elementos; i++) {
    const item = block[i];
    if (item && typeof item === 'object' && 'city' in item) {
      const city = String((item as Record<string, unknown>).city ?? '').trim();
      if (city && !seen.has(city)) {
        seen.add(city);
        result.push(city);
      }
    }
  }

  return result.sort((a, b) => a.localeCompare(b, 'es'));
}

export async function getStats(): Promise<{ total: number; zones: number }> {
  const [pagResp, citiesResp] = await Promise.all([
    inmovillaClient.query().paginacion(1, 1).fetch(),
    inmovillaClient.query().ciudades(1, 500).fetch(),
  ]);

  const total = getMeta(pagResp.paginacion as RawBlock ?? {}).total ?? 0;
  const zones = getMeta(citiesResp.ciudades as RawBlock ?? {}).elementos ?? 0;
  return { total, zones };
}

export async function getPropertyCountByCity(): Promise<Record<string, number>> {
  // Solo para las zonas hardcoded de la home; peticiones en paralelo
  const hardcodedCities = [
    'Santa Perpètua de Mogoda',
    'Castelldefels',
    'Vilanova del Vallès',
    'Montcada i Reixac',
    'Sant Adrià de Besòs',
    'Les Franqueses del Vallès',
  ];

  const entries = await Promise.all(
    hardcodedCities.map(async (city): Promise<[string, number]> => {
      try {
        const safeCity = city.replace(/'/g, "''");
        const resp = await inmovillaClient.query()
          .paginacion(1, 1, `ciudad='${safeCity}'`)
          .fetch();
        const count = getMeta(resp.paginacion as RawBlock ?? {}).total ?? 0;
        return [city, count];
      } catch {
        return [city, 0];
      }
    }),
  );

  return Object.fromEntries(entries);
}

export { formatPrice } from '@/lib/propertyUtils';

// Re-export normalize helper usado en filtros
export { normalize };
