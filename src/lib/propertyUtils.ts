import type { Property } from '@/types/property';

export function formatPrice(price: number, operation: Property['operation']): string {
  const formatted = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(price);
  return operation === 'alquiler' ? `${formatted}/mes` : formatted;
}
