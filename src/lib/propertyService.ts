import {
  Property,
  PropertyFilters,
  PropertySearchResult,
  PropertyType,
  OperationType,
  PropertyStatus,
} from '@/types/property';
import { db } from '@/lib/db';
import { normalize } from '@/lib/utils';
import { MUNICIPALITY_ALIASES } from '@/data/catalanMunicipalities';
import type {
  Property as PrismaProperty,
  PropertyFeatures as PrismaFeatures,
  PropertyLocation as PrismaLocation,
  PropertyImage as PrismaImage,
  Prisma,
} from '@prisma/client';

// ─── Mapper BD → tipo interno ─────────────────────────────────────────────────

type PropertyWithRelations = PrismaProperty & {
  features: PrismaFeatures | null;
  location: PrismaLocation | null;
  images: PrismaImage[];
};

/**
 * Estado que ve el público: la reserva manual del panel solo aplica mientras
 * Inmovilla lo tenga disponible (si se vende, manda el estado de la sync).
 */
function publicStatus(p: Pick<PrismaProperty, 'status' | 'manualReserved'>): PropertyStatus {
  return p.manualReserved && p.status === 'disponible' ? 'reservado' : (p.status as PropertyStatus);
}

/** Disponibles de verdad: ni vendidos ni reservados desde el panel */
const AVAILABLE: Prisma.PropertyWhereInput = { status: 'disponible', manualReserved: false };

function mapToProperty(p: PropertyWithRelations): Property {
  return {
    id: p.id,
    reference: p.reference,
    title: p.title,
    description: p.description,
    type: p.type as PropertyType,
    operation: p.operation as OperationType,
    status: publicStatus(p),
    price: p.price,
    pricePerM2: p.pricePerM2 ?? undefined,
    isFeatured: p.isFeatured,
    isNewDevelopment: p.isNewDevelopment,
    publishedAt: p.publishedAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    features: {
      bedrooms: p.features?.bedrooms ?? 0,
      bathrooms: p.features?.bathrooms ?? 0,
      area: p.features?.area ?? 0,
      plotArea: p.features?.plotArea ?? undefined,
      floor: p.features?.floor ?? undefined,
      hasGarage: p.features?.hasGarage ?? false,
      hasPool: p.features?.hasPool ?? false,
      hasTerrace: p.features?.hasTerrace ?? false,
      hasGarden: p.features?.hasGarden ?? false,
      hasElevator: p.features?.hasElevator ?? false,
      hasAirConditioning: p.features?.hasAirConditioning ?? false,
      hasHeating: p.features?.hasHeating ?? false,
      hasStorageRoom: p.features?.hasStorageRoom ?? false,
      orientation: p.features?.orientation ?? undefined,
      energyCertificate: p.features?.energyCertificate ?? undefined,
    },
    location: {
      address: p.location?.address ?? '',
      city: p.location?.city ?? '',
      province: p.location?.province ?? '',
      postalCode: p.location?.postalCode ?? '',
      neighborhood: p.location?.neighborhood ?? undefined,
      lat: p.location?.lat ?? undefined,
      lng: p.location?.lng ?? undefined,
    },
    images: p.images
      .sort((a, b) => a.order - b.order)
      .map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
        isPrimary: img.isPrimary,
      })),
  };
}

// ─── Búsqueda por ciudad con normalización de acentos ─────────────────────────
// PostgreSQL ILIKE no ignora acentos, así que filtramos en JS tras la consulta.

// Alias por nombre oficial normalizado, p. ej. "palau solita i plegamans" -> ["palau plegamans"]
const ALIASES_BY_QUERY = new Map(
  Object.entries(MUNICIPALITY_ALIASES).map(([official, aliases]) => [normalize(official), aliases.map(normalize)])
);

function matchesCity(p: Property, query: string): boolean {
  const q = normalize(query);
  if (!q) return true;
  const terms = [q, ...(ALIASES_BY_QUERY.get(q) ?? [])];
  return [
    p.location.city,
    p.location.neighborhood ?? '',
    p.location.province,
    p.location.postalCode,
    p.location.address,
  ].some((field) => {
    const f = normalize(field);
    return terms.some((term) => f.includes(term));
  });
}

// ─── API pública del servicio ─────────────────────────────────────────────────

type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'newest';

export async function getProperties(
  filters: PropertyFilters = {},
  page = 1,
  pageSize = 9,
  sort: SortOption = 'relevance'
): Promise<PropertySearchResult> {
  // Filtros que pueden resolverse en SQL
  const where: Prisma.PropertyWhereInput = { status: { not: 'vendido' } };
  if (filters.operation) where.operation = filters.operation;
  if (filters.type) where.type = filters.type;
  if (filters.isFeatured) where.isFeatured = true;
  if (filters.isNewDevelopment) where.isNewDevelopment = true;
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {
      ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
    };
  }
  if (filters.minBedrooms !== undefined) {
    where.features = { bedrooms: { gte: filters.minBedrooms } };
  }

  // Los marcados como poco prioritarios van siempre al final, sea cual sea el orden
  const orderBy: Prisma.PropertyOrderByWithRelationInput[] = [
    { lowPriority: 'asc' },
    ...(sort === 'price_asc'  ? [{ price: 'asc' as const }] :
        sort === 'price_desc' ? [{ price: 'desc' as const }] :
        sort === 'newest'     ? [{ publishedAt: 'desc' as const }] :
        [{ isFeatured: 'desc' as const }, { publishedAt: 'desc' as const }]),
  ];

  const rows = await db.property.findMany({
    where,
    include: { features: true, location: true, images: true },
    orderBy,
  });

  // Filtros JS: acentos en ciudad y características booleanas
  const all = rows.map(mapToProperty).filter((p) => {
    if (filters.city && !matchesCity(p, filters.city)) return false;
    if (filters.minBathrooms !== undefined && p.features.bathrooms < filters.minBathrooms) return false;
    if (filters.minArea !== undefined && p.features.area < filters.minArea) return false;
    if (filters.maxArea !== undefined && p.features.area > filters.maxArea) return false;
    if (filters.hasGarage && !p.features.hasGarage) return false;
    if (filters.hasPool && !p.features.hasPool) return false;
    if (filters.hasTerrace && !p.features.hasTerrace) return false;
    return true;
  });

  const start = (page - 1) * pageSize;
  return {
    properties: all.slice(start, start + pageSize),
    total: all.length,
    page,
    pageSize,
    totalPages: Math.ceil(all.length / pageSize),
  };
}

export async function getPropertyById(id: string): Promise<Property | null> {
  const p = await db.property.findUnique({
    where: { id },
    include: { features: true, location: true, images: true },
  });
  return p ? mapToProperty(p) : null;
}

export async function getFeaturedProperties(limit = 4): Promise<Property[]> {
  const featured = await db.property.findMany({
    where: { isFeatured: true, status: { not: 'vendido' } },
    include: { features: true, location: true, images: true },
    orderBy: [{ lowPriority: 'asc' }, { publishedAt: 'desc' }],
    take: limit,
  });

  if (featured.length >= limit) return featured.map(mapToProperty);

  const featuredIds = featured.map((p) => p.id);
  const filler = await db.property.findMany({
    where: { id: { notIn: featuredIds }, status: { not: 'vendido' } },
    include: { features: true, location: true, images: true },
    orderBy: [{ lowPriority: 'asc' }, { publishedAt: 'desc' }],
    take: limit - featured.length,
  });

  return [...featured, ...filler].map(mapToProperty);
}

export async function getRelatedProperties(property: Property, limit = 3): Promise<Property[]> {
  const rows = await db.property.findMany({
    where: {
      id: { not: property.id },
      type: property.type,
      operation: property.operation,
      status: { not: 'vendido' },
    },
    include: { features: true, location: true, images: true },
    orderBy: [{ lowPriority: 'asc' }, { publishedAt: 'desc' }],
    take: limit,
  });
  return rows.map(mapToProperty);
}

export async function getAllLocations(): Promise<string[]> {
  const rows = await db.propertyLocation.findMany({
    select: { city: true, neighborhood: true },
  });
  const seen = new Set<string>();
  const result: string[] = [];
  for (const row of rows) {
    for (const val of [row.city, row.neighborhood]) {
      if (val && !seen.has(val)) {
        seen.add(val);
        result.push(val);
      }
    }
  }
  return result.sort((a, b) => a.localeCompare(b, 'es'));
}

export async function getStats(): Promise<{ total: number; zones: number }> {
  const [total, cities] = await Promise.all([
    db.property.count({ where: AVAILABLE }),
    db.propertyLocation.findMany({ select: { city: true }, distinct: ['city'] }),
  ]);
  return { total, zones: cities.length };
}

export async function getPropertyCountByCity(): Promise<Record<string, number>> {
  const rows = await db.propertyLocation.groupBy({
    by: ['city'],
    _count: { city: true },
  });
  return Object.fromEntries(rows.map((r) => [r.city, r._count.city]));
}

export { formatPrice } from '@/lib/propertyUtils';

// ─── Mercado por municipio (páginas de captación) ────────────────────────────

export interface MunicipalityMarket {
  /** Todos los inmuebles del municipio, activos primero y luego vendidos/reservados */
  properties: Property[];
  forSale: number;
  soldOrReserved: number;
  /** Mediana de €/m² de los inmuebles en venta; null si hay menos de 3 */
  medianPricePerM2: number | null;
}

/** Coincidencia estricta por municipio (city), no por provincia, barrio o dirección. */
export async function getMunicipalityMarket(city: string): Promise<MunicipalityMarket> {
  const keys = new Set([
    normalize(city),
    ...(Object.entries(MUNICIPALITY_ALIASES).find(([official]) => normalize(official) === normalize(city))?.[1] ?? []).map(normalize),
  ]);

  const rows = await db.property.findMany({
    include: { features: true, location: true, images: true },
    orderBy: [{ lowPriority: 'asc' }, { publishedAt: 'desc' }],
  });
  const properties = rows
    .filter((p) => keys.has(normalize(p.location?.city ?? '')))
    .map(mapToProperty)
    .sort((a, b) => Number(a.status !== 'disponible') - Number(b.status !== 'disponible'));

  const pm2 = properties
    .filter((p) => p.operation === 'venta' && p.status === 'disponible' && ['piso', 'atico', 'casa', 'chalet'].includes(p.type))
    .map((p) => p.pricePerM2 ?? (p.features.area > 0 ? p.price / p.features.area : 0))
    .filter((v) => v >= 500 && v <= 15000)
    .sort((a, b) => a - b);
  const mid = Math.floor(pm2.length / 2);

  return {
    properties,
    forSale: properties.filter((p) => p.operation === 'venta' && p.status === 'disponible').length,
    soldOrReserved: properties.filter((p) => p.status === 'vendido' || p.status === 'reservado').length,
    medianPricePerM2: pm2.length >= 3 ? Math.round(pm2.length % 2 ? pm2[mid] : (pm2[mid - 1] + pm2[mid]) / 2) : null,
  };
}
