/** Opciones del valorador: sin dependencias de servidor, se importan también desde el cliente. */

export const PROPERTY_TYPES = {
  piso: 'Piso',
  atico: 'Ático',
  casa: 'Casa o adosado',
  chalet: 'Chalet',
} as const;

export const CONDITIONS = {
  reformar: { label: 'A reformar', factor: 0.88 },
  buen_estado: { label: 'Buen estado', factor: 1 },
  reformado: { label: 'Reformado', factor: 1.07 },
  nuevo: { label: 'Obra nueva o a estrenar', factor: 1.12 },
} as const;

export const EXTRAS = {
  ascensor: { label: 'Ascensor', factor: 0.04 },
  terraza: { label: 'Terraza o balcón grande', factor: 0.03 },
  parking: { label: 'Plaza de parking', factor: 0.03 },
  piscina: { label: 'Piscina', factor: 0.04 },
  jardin: { label: 'Jardín', factor: 0.03 },
} as const;

export const TIMINGS = {
  ya: 'Lo antes posible',
  meses: 'En los próximos 3 a 6 meses',
  info: 'Solo quiero saber lo que vale',
} as const;

export type PropertyTypeKey = keyof typeof PROPERTY_TYPES;
export type ConditionKey = keyof typeof CONDITIONS;
export type ExtraKey = keyof typeof EXTRAS;
export type TimingKey = keyof typeof TIMINGS;
