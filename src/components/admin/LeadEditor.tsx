'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LEAD_STATUSES, type LeadStatus } from '@/lib/leads';

export default function LeadEditor({ id, status, notes }: { id: string; status: string; notes: string | null }) {
  const router = useRouter();
  const [current, setCurrent] = useState(status);
  const [text, setText] = useState(notes ?? '');
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const searchParams = useSearchParams();
  const [deleting, setDeleting] = useState(false);

  async function remove() {
    if (!window.confirm('¿Borrar esta solicitud? Se eliminará definitivamente y no se puede deshacer.')) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/leads/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      setDeleting(false);
      setState('error');
      return;
    }
    // Vuelve al listado conservando los filtros activos
    const params = new URLSearchParams(searchParams.toString());
    params.delete('id');
    const qs = params.toString();
    router.push(`/admin/solicitudes${qs ? `?${qs}` : ''}`);
    router.refresh();
  }

  async function save(patch: { status?: string; notes?: string }) {
    setState('saving');
    const res = await fetch(`/api/admin/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    setState(res.ok ? 'saved' : 'error');
    if (res.ok) router.refresh();
  }

  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="mb-2 text-xs text-white/50">Estado</legend>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(LEAD_STATUSES) as LeadStatus[]).map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={current === key}
              onClick={() => {
                setCurrent(key);
                void save({ status: key });
              }}
              className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                current === key ? 'bg-[var(--rose)] text-[var(--dark)]' : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {LEAD_STATUSES[key]}
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor={`notes-${id}`} className="mb-2 block text-xs text-white/50">Notas internas</label>
        <textarea
          id={`notes-${id}`}
          rows={4}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setState('idle');
          }}
          placeholder="Llamada, visita, precio acordado..."
          className="w-full resize-y rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--rose)]"
        />
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={() => save({ notes: text })}
            disabled={state === 'saving'}
            className="rounded-full bg-white/10 px-4 py-2 text-xs text-white transition hover:bg-white/20 disabled:opacity-50"
          >
            Guardar notas
          </button>
          <span className="text-xs text-white/50" role="status">
            {state === 'saving' ? 'Guardando...' : state === 'saved' ? 'Guardado' : state === 'error' ? 'No se pudo guardar' : ''}
          </span>
        </div>
      </div>

      <div className="border-t border-white/10 pt-5">
        <button
          type="button"
          onClick={remove}
          disabled={deleting}
          className="rounded-full border border-red-400/40 px-4 py-2 text-xs text-red-300 transition hover:bg-red-500/15 disabled:opacity-50"
        >
          {deleting ? 'Borrando...' : 'Borrar solicitud'}
        </button>
      </div>
    </div>
  );
}
