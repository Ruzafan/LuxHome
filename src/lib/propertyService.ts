/**
 * PropertyService — capa de abstracción de datos
 *
 * Actualmente usa datos mock. Para conectar con Inmovilla:
 * 1. Configura INMOVILLA_API_URL e INMOVILLA_API_KEY en .env.local
 * 2. Sustituye las funciones de este módulo por llamadas a la API de Inmovilla
 * 3. Adapta los tipos de respuesta en src/types/property.ts si es necesario
 *
 * Documentación API Inmovilla: https://www.inmovilla.com/integracion
 */

import { Property, PropertyFilters, PropertySearchResult } from '@/types/property';
import { mockProperties } from '@/data/mockProperties';
import { normalize } from '@/lib/utils';

// ─── Configuración Inmovilla (para cuando se integre el backend) ──────────────
const INMOVILLA_API_URL = process.env.INMOVILLA_API_URL ?? '';
const INMOVILLA_API_KEY = process.env.INMOVILLA_API_KEY ?? '';
const USE_MOCK = !INMOVILLA_API_URL || !INMOVILLA_API_KEY;

// ─── Helpers ─────────────────────────────────────────────────────────────────


function matchesCity(property: Property, query: string): boolean {
  const q = normalize(query);
  if (!q) return true;
  const searchFields = [
    property.location.city,
    property.location.neighborhood ?? '',
    property.location.province,
    property.location.postalCode,
    property.location.address,
  ];
  return searchFields.some((field) => normalize(field).includes(q));
}

function applyFilters(properties: Property[], filters: PropertyFilters): Property[] {
  return properties.filter((p) => {
    if (filters.operation && p.operation !== filters.operation) return false;
    if (filters.type && p.type !== filters.type) return false;
    if (filters.city && !matchesCity(p, filters.city)) return false;
    if (filters.minPrice !== undefined && p.price < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && p.price > filters.maxPrice) return false;
    if (filters.minBedrooms !== undefined && p.features.bedrooms < filters.minBedrooms) return false;
    if (filters.minBathrooms !== undefined && p.features.bathrooms < filters.minBathrooms) return false;
    if (filters.minArea !== undefined && p.features.area < filters.minArea) return false;
    if (filters.maxArea !== undefined && p.features.area > filters.maxArea) return false;
    if (filters.hasGarage && !p.features.hasGarage) return false;
    if (filters.hasPool && !p.features.hasPool) return false;
    if (filters.hasTerrace && !p.features.hasTerrace) return false;
    return true;
  });
}

// ─── API pública del servicio ─────────────────────────────────────────────────

export async function getProperties(
  filters: PropertyFilters = {},
  page = 1,
  pageSize = 9
): Promise<PropertySearchResult> {
  if (!USE_MOCK) {
    // TODO: Reemplazar con llamada real a Inmovilla
    // const response = await fetch(`${INMOVILLA_API_URL}/propiedades?...`, {
    //   headers: { Authorization: `Bearer ${INMOVILLA_API_KEY}` },
    // });
    // const data = await response.json();
    // return adaptInmovillaResponse(data);
  }

  const filtered = applyFilters(mockProperties, filters);
  const start = (page - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  return {
    properties: paginated,
    total: filtered.length,
    page,
    pageSize,
    totalPages: Math.ceil(filtered.length / pageSize),
  };
}

export async function getPropertyById(id: string): Promise<Property | null> {
  if (!USE_MOCK) {
    // TODO: Reemplazar con llamada real a Inmovilla
    // const response = await fetch(`${INMOVILLA_API_URL}/propiedades/${id}`, {
    //   headers: { Authorization: `Bearer ${INMOVILLA_API_KEY}` },
    // });
    // if (!response.ok) return null;
    // return adaptInmovillaProperty(await response.json());
  }

  return mockProperties.find((p) => p.id === id) ?? null;
}

export async function getFeaturedProperties(limit = 4): Promise<Property[]> {
  if (!USE_MOCK) {
    // TODO: Reemplazar con llamada real a Inmovilla (filtro destacados)
  }

  return mockProperties.filter((p) => p.isFeatured).slice(0, limit);
}

export async function getRelatedProperties(property: Property, limit = 3): Promise<Property[]> {
  if (!USE_MOCK) {
    // TODO: Reemplazar con llamada real a Inmovilla
  }

  return mockProperties
    .filter(
      (p) =>
        p.id !== property.id &&
        p.type === property.type &&
        p.operation === property.operation
    )
    .slice(0, limit);
}

/**
 * Devuelve todas las ubicaciones únicas del catálogo (ciudades + barrios).
 * Al conectar con Inmovilla, sustituir por llamada a la API.
 */
export function getAllLocations(): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const p of mockProperties) {
    for (const val of [p.location.city, p.location.neighborhood]) {
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
