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
      <label className="whitespace-nowrap text-[13px] text-[var(--mid)]">{label}:</label>
      <select
        value={currentSort}
        onChange={handleChange}
        className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--rose)]"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
