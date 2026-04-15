// Tipos base de propiedades — espejo del modelo de Inmovilla
// Cuando se conecte el backend real, estos tipos deben coincidir con la respuesta de la API

export type PropertyType = 'piso' | 'casa' | 'chalet' | 'atico' | 'local' | 'terreno' | 'garaje';
export type OperationType = 'venta' | 'alquiler';
export type PropertyStatus = 'disponible' | 'reservado' | 'vendido' | 'alquilado';

export interface PropertyImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface PropertyFeatures {
  bedrooms: number;
  bathrooms: number;
  area: number;          // m²
  plotArea?: number;     // m² (solo para casas/chalets)
  floor?: number;        // Planta (para pisos)
  hasGarage: boolean;
  hasPool: boolean;
  hasTerrace: boolean;
  hasGarden: boolean;
  hasElevator: boolean;
  hasAirConditioning: boolean;
  hasHeating: boolean;
  hasStorageRoom: boolean;
  orientation?: string;  // Norte, Sur, Este, Oeste
  energyCertificate?: string; // A, B, C, D, E, F, G
}

export interface PropertyLocation {
  address: string;
  city: string;
  province: string;
  postalCode: string;
  neighborhood?: string;
  lat?: number;
  lng?: number;
}

export interface Property {
  id: string;
  reference: string;     // Referencia interna (ej: LH-001)
  title: string;
  description: string;
  type: PropertyType;
  operation: OperationType;
  status: PropertyStatus;
  price: number;
  pricePerM2?: number;
  features: PropertyFeatures;
  location: PropertyLocation;
  images: PropertyImage[];
  isFeatured: boolean;
  isNewDevelopment: boolean;
  publishedAt: string;   // ISO date
  updatedAt: string;     // ISO date
  virtualTourUrl?: string;
}

// Filtros para el listado
export interface PropertyFilters {
  operation?: OperationType;
  type?: PropertyType;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  minArea?: number;
  maxArea?: number;
  hasGarage?: boolean;
  hasPool?: boolean;
  hasTerrace?: boolean;
}

export interface PropertySearchResult {
  properties: Property[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
