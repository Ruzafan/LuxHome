'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Flag = 'manualReserved' | 'lowPriority';

const LABELS: Record<Flag, string> = {
  manualReserved: 'Reservado',
  lowPriority: 'Al final',
};

export default function PropertyFlags({
  id,
  manualReserved,
  lowPriority,
  sold,
}: {
  id: string;
  manualReserved: boolean;
  lowPriority: boolean;
  /** Vendido/alquilado en Inmovilla: la reserva no se muestra mientras lo esté */
  sold: boolean;
}) {
  const router = useRouter();
  const [values, setValues] = useState({ manualReserved, lowPriority });
  const [saving, setSaving] = useState<Flag | null>(null);
  const [error, setError] = useState(false);

  async function toggle(flag: Flag) {
    const next = !values[flag];
    setSaving(flag);
    setError(false);
    setValues((v) => ({ ...v, [flag]: next }));
    const res = await fetch(`/api/admin/properties/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [flag]: next }),
    });
    setSaving(null);
    if (!res.ok) {
      setValues((v) => ({ ...v, [flag]: !next }));
      setError(true);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {(Object.keys(LABELS) as Flag[]).map((flag) => (
        <button
          key={flag}
          type="button"
          aria-pressed={values[flag]}
          disabled={saving !== null}
          onClick={() => toggle(flag)}
          title={flag === 'manualReserved' && sold ? 'Vendido en Inmovilla: la reserva no se muestra' : undefined}
          className={`rounded-full px-3 py-1.5 text-xs transition-colors disabled:opacity-60 ${
            values[flag] ? 'bg-[var(--rose)] text-[var(--dark)]' : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          {LABELS[flag]}
        </button>
      ))}
      {error && <span className="text-xs text-red-300" role="status">No se pudo guardar</span>}
    </div>
  );
}
