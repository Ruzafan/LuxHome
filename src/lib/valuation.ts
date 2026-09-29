import { db } from '@/lib/db';
import { normalize } from '@/lib/utils';
import { MUNICIPALITY_ALIASES } from '@/data/catalanMunicipalities';
import { SELL_MUNICIPALITIES } from '@/data/sellZones';
import {
  PROPERTY_TYPES, CONDITIONS, EXTRAS, TIMINGS,
  type PropertyTypeKey, type ConditionKey, type ExtraKey, type TimingKey,
} from '@/lib/valuationOptions';

/**
 * Valoración orientativa a partir de los inmuebles en venta de la propia cartera (comparables).
 * No inventa precios: si no hay comparables suficientes devuelve estimate = null y el equipo
 * valora manualmente tras la llamada.
 */

export { PROPERTY_TYPES, CONDITIONS, EXTRAS, TIMINGS } from '@/lib/valuationOptions';
export type { PropertyTypeKey, ConditionKey, ExtraKey, TimingKey } from '@/lib/valuationOptions';

export interface ValuationInput {
  city: string;
  address?: string;
  type: PropertyTypeKey;
  area: number;
  bedrooms: number;
  bathrooms: number;
  condition: ConditionKey;
  extras: ExtraKey[];
  timing: TimingKey;
}

export interface ValuationEstimate {
  min: number;
  max: number;
  pricePerM2: number;
  comparables: number;
  basis: 'municipio' | 'comarca';
}

/** Lo que se guarda en Lead.valuation (etiquetas incluidas para emails y panel) */
export interface ValuationData extends ValuationInput {
  typeLabel: string;
  conditionLabel: string;
  extrasLabels: string[];
  timingLabel: string;
  estimate: ValuationEstimate | null;
}

const MIN_CITY_COMPARABLES = 3;
const MIN_COMARCA_COMPARABLES = 5;

const isFlat = (type: string) => type === 'piso' || type === 'atico';

function cityKeys(city: string): string[] {
  const official = Object.keys(MUNICIPALITY_ALIASES).find((k) => normalize(k) === normalize(city));
  return [normalize(city), ...(official ? MUNICIPALITY_ALIASES[official].map(normalize) : [])];
}

function median(values: number[]): number {
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

const round1000 = (n: number) => Math.round(n / 1000) * 1000;

export function parseValuationInput(body: Record<string, unknown>): ValuationInput | null {
  const city = String(body.city ?? '').trim().slice(0, 120);
  const type = String(body.type ?? '') as PropertyTypeKey;
  const condition = String(body.condition ?? '') as ConditionKey;
  const timing = String(body.timing ?? '') as TimingKey;
  const area = Number(body.area);
  const bedrooms = Number(body.bedrooms);
  const bathrooms = Number(body.bathrooms);
  const extras = (Array.isArray(body.extras) ? body.extras : []).filter(
    (e): e is ExtraKey => typeof e === 'string' && e in EXTRAS
  );

  if (!city || !(type in PROPERTY_TYPES) || !(condition in CONDITIONS) || !(timing in TIMINGS)) return null;
  if (!Number.isFinite(area) || area < 15 || area > 2000) return null;
  if (!Number.isInteger(bedrooms) || bedrooms < 0 || bedrooms > 15) return null;
  if (!Number.isInteger(bathrooms) || bathrooms < 1 || bathrooms > 10) return null;

  return {
    city,
    address: String(body.address ?? '').trim().slice(0, 200) || undefined,
    type,
    area: Math.round(area),
    bedrooms,
    bathrooms,
    condition,
    extras,
    timing,
  };
}

export async function estimateValue(input: ValuationInput): Promise<ValuationEstimate | null> {
  const rows = await db.property.findMany({
    where: { operation: 'venta', price: { gt: 0 } },
    select: {
      type: true,
      price: true,
      pricePerM2: true,
      features: { select: { area: true } },
      location: { select: { city: true } },
    },
  });

  const comparables = rows
    .map((p) => {
      const area = p.features?.area ?? 0;
      const pm2 = p.pricePerM2 ?? (area > 0 ? p.price / area : 0);
      return { type: p.type, city: normalize(p.location?.city ?? ''), pm2, area };
    })
    // Descarta terrenos, locales, garajes y valores absurdos
    .filter((c) => ['piso', 'atico', 'casa', 'chalet'].includes(c.type) && c.area >= 25 && c.pm2 >= 500 && c.pm2 <= 15000);

  const keys = cityKeys(input.city);
  const sameGroup = (c: { type: string }) => isFlat(c.type) === isFlat(input.type);
  const inCity = comparables.filter((c) => keys.includes(c.city));

  const comarca = SELL_MUNICIPALITIES.find((m) => normalize(m.name) === normalize(input.city))?.comarca;
  const comarcaCities = new Set(comarca?.municipalities.flatMap((m) => cityKeys(m.name)) ?? []);
  const inComarca = comparables.filter((c) => comarcaCities.has(c.city));

  const candidates: [typeof comparables, ValuationEstimate['basis'], number][] = [
    [inCity.filter(sameGroup), 'municipio', MIN_CITY_COMPARABLES],
    [inCity, 'municipio', MIN_CITY_COMPARABLES],
    [inComarca.filter(sameGroup), 'comarca', MIN_COMARCA_COMPARABLES],
    [inComarca, 'comarca', MIN_COMARCA_COMPARABLES],
  ];
  const pick = candidates.find(([list, , min]) => list.length >= min);
  if (!pick) return null;

  const [list, basis] = pick;
  const basePm2 = median(list.map((c) => c.pm2));
  const factor =
    CONDITIONS[input.condition].factor *
    (1 + input.extras.reduce((sum, e) => sum + EXTRAS[e].factor, 0));
  const value = basePm2 * input.area * factor;
  // Horquilla más ancha cuando la base es la comarca y no el municipio
  const spread = basis === 'municipio' ? 0.08 : 0.12;

  return {
    min: round1000(value * (1 - spread)),
    max: round1000(value * (1 + spread)),
    pricePerM2: Math.round(basePm2),
    comparables: list.length,
    basis,
  };
}

export function toValuationData(input: ValuationInput, estimate: ValuationEstimate | null): ValuationData {
  return {
    ...input,
    typeLabel: PROPERTY_TYPES[input.type],
    conditionLabel: CONDITIONS[input.condition].label,
    extrasLabels: input.extras.map((e) => EXTRAS[e].label),
    timingLabel: TIMINGS[input.timing],
    estimate,
  };
}
