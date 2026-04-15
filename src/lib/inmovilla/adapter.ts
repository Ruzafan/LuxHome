/**
 * Adaptador Inmovilla → Schema interno
 *
 * Convierte el formato de Inmovilla a estructuras planas usadas por sync.ts.
 * Al conectar la API real, ajusta los nombres de campo aquí sin tocar nada más.
 */

// ─── Tipos de entrada (Inmovilla) ─────────────────────────────────────────────

export interface InmovillaProperty {
  id: number | string;
  referencia: string;
  titulo: string;
  descripcion: string;
  tipo_inmueble: string;
  tipo_operacion: string;
  estado: string;
  precio: number;
  precio_m2?: number;
  destacado: boolean;
  obra_nueva: boolean;
  fecha_publicacion: string;
  // Características
  habitaciones: number;
  banos: number;
  superficie: number;
  superficie_parcela?: number;
  planta?: number;
  garaje: boolean;
  piscina: boolean;
  terraza: boolean;
  jardin: boolean;
  ascensor: boolean;
  aire_acondicionado: boolean;
  calefaccion: boolean;
  trastero: boolean;
  orientacion?: string;
  certificado_energetico?: string;
  // Ubicación
  direccion: string;
  municipio: string;
  provincia: string;
  codigo_postal: string;
  barrio?: string;
  latitud?: number;
  longitud?: number;
  // Imágenes
  imagenes: Array<{
    url: string;
    descripcion: string;
    principal: boolean;
    orden: number;
  }>;
}

// ─── Tipos de salida (datos planos, sin relaciones Prisma) ────────────────────

export interface PropertyScalars {
  inmovillaId:      string;
  reference:        string;
  title:            string;
  description:      string;
  type:             string;
  operation:        string;
  status:           string;
  price:            number;
  pricePerM2:       number | null;
  isFeatured:       boolean;
  isNewDevelopment: boolean;
  publishedAt:      Date;
}

export interface FeaturesData {
  bedrooms:           number;
  bathrooms:          number;
  area:               number;
  plotArea:           number | null;
  floor:              number | null;
  hasGarage:          boolean;
  hasPool:            boolean;
  hasTerrace:         boolean;
  hasGarden:          boolean;
  hasElevator:        boolean;
  hasAirConditioning: boolean;
  hasHeating:         boolean;
  hasStorageRoom:     boolean;
  orientation:        string | null;
  energyCertificate:  string | null;
}

export interface LocationData {
  address:      string;
  city:         string;
  province:     string;
  postalCode:   string;
  neighborhood: string | null;
  lat:          number | null;
  lng:          number | null;
}

export interface ImageData {
  url:       string;
  alt:       string;
  isPrimary: boolean;
  order:     number;
}

export interface AdaptedProperty {
  scalars:  PropertyScalars;
  features: FeaturesData;
  location: LocationData;
  images:   ImageData[];
}

// ─── Conversión ───────────────────────────────────────────────────────────────

export function adaptInmovillaProperty(raw: InmovillaProperty): AdaptedProperty {
  return {
    scalars: {
      inmovillaId:      String(raw.id),
      reference:        raw.referencia,
      title:            raw.titulo,
      description:      raw.descripcion,
      type:             raw.tipo_inmueble,
      operation:        raw.tipo_operacion,
      status:           raw.estado,
      price:            raw.precio,
      pricePerM2:       raw.precio_m2 ?? null,
      isFeatured:       raw.destacado,
      isNewDevelopment: raw.obra_nueva,
      publishedAt:      new Date(raw.fecha_publicacion),
    },
    features: {
      bedrooms:           raw.habitaciones,
      bathrooms:          raw.banos,
      area:               raw.superficie,
      plotArea:           raw.superficie_parcela ?? null,
      floor:              raw.planta ?? null,
      hasGarage:          raw.garaje,
      hasPool:            raw.piscina,
      hasTerrace:         raw.terraza,
      hasGarden:          raw.jardin,
      hasElevator:        raw.ascensor,
      hasAirConditioning: raw.aire_acondicionado,
      hasHeating:         raw.calefaccion,
      hasStorageRoom:     raw.trastero,
      orientation:        raw.orientacion ?? null,
      energyCertificate:  raw.certificado_energetico ?? null,
    },
    location: {
      address:      raw.direccion,
      city:         raw.municipio,
      province:     raw.provincia,
      postalCode:   raw.codigo_postal,
      neighborhood: raw.barrio ?? null,
      lat:          raw.latitud ?? null,
      lng:          raw.longitud ?? null,
    },
    images: raw.imagenes.map((img) => ({
      url:       img.url,
      alt:       img.descripcion,
      isPrimary: img.principal,
      order:     img.orden,
    })),
  };
}
