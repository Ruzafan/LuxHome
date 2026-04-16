'use client';

import { useRouter, usePathname } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';

interface Props {
  currentSort: string;
  label: string;
  options: { value: string; label: string }[];
}

export default function SortSelect({ currentSort, label, options }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value && e.target.value !== 'relevance') {
      params.set('orden', e.target.value);
    } else {
      params.delete('orden');
    }
    params.delete('pagina');
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-gray-500 whitespace-nowrap">{label}:</label>
      <select
        value={currentSort}
        onChange={handleChange}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c] bg-white"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
