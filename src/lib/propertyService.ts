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
import type {
  Property as PrismaProperty,
  PropertyFeatures as PrismaFeatures,
  PropertyLocation as PrismaLocation,
  PropertyImage as PrismaImage,
} from '@prisma/client';

// ─── Mapper BD → tipo interno ─────────────────────────────────────────────────

type PropertyWithRelations = PrismaProperty & {
  features: PrismaFeatures | null;
  location: PrismaLocation | null;
  images: PrismaImage[];
};

function mapToProperty(p: PropertyWithRelations): Property {
  return {
    id: p.id,
    reference: p.reference,
    title: p.title,
    description: p.description,
    type: p.type as PropertyType,
    operation: p.operation as OperationType,
    status: p.status as PropertyStatus,
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

function matchesCity(p: Property, query: string): boolean {
  const q = normalize(query);
  if (!q) return true;
  return [
    p.location.city,
    p.location.neighborhood ?? '',
    p.location.province,
    p.location.postalCode,
    p.location.address,
  ].some((field) => normalize(field).includes(q));
}

// ─── API pública del servicio ─────────────────────────────────────────────────

export async function getProperties(
  filters: PropertyFilters = {},
  page = 1,
  pageSize = 9
): Promise<PropertySearchResult> {
  // Filtros que pueden resolverse en SQL
  const where: Parameters<typeof db.property.findMany>[0]['where'] = {};
  if (filters.operation) where.operation = filters.operation;
  if (filters.type) where.type = filters.type;
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {
      ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
    };
  }
  if (filters.minBedrooms !== undefined) {
    where.features = { bedrooms: { gte: filters.minBedrooms } };
  }

  const rows = await db.property.findMany({
    where,
    include: { features: true, location: true, images: true },
    orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }],
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
  const rows = await db.property.findMany({
    where: { isFeatured: true },
    include: { features: true, location: true, images: true },
    orderBy: { publishedAt: 'desc' },
    take: limit,
  });
  return rows.map(mapToProperty);
}

export async function getRelatedProperties(property: Property, limit = 3): Promise<Property[]> {
  const rows = await db.property.findMany({
    where: {
      id: { not: property.id },
      type: property.type,
      operation: property.operation,
    },
    include: { features: true, location: true, images: true },
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

export function formatPrice(price: number, operation: Property['operation']): string {
  const formatted = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(price);
  return operation === 'alquiler' ? `${formatted}/mes` : formatted;
}
