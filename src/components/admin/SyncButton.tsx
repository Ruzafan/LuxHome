'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SyncResult {
  created: number;
  updated: number;
  deactivated: number;
}

export default function SyncButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSync() {
    setLoading(true);
    setResult(null);
    setError('');

    const res = await fetch('/api/admin/sync', { method: 'POST' });
    const data = await res.json();

    if (res.ok) {
      setResult(data);
      router.refresh();
    } else {
      setError(data.error ?? 'Error al sincronizar');
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
      )}

      {result && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3 text-sm space-y-1">
          <p className="text-green-400 font-medium">Sincronización completada</p>
          <p className="text-white/60">
            Creados: <span className="text-white font-medium">{result.created}</span>
          </p>
          <p className="text-white/60">
            Actualizados: <span className="text-white font-medium">{result.updated}</span>
          </p>
          <p className="text-white/60">
            Desactivados: <span className="text-white font-medium">{result.deactivated}</span>
          </p>
        </div>
      )}

      <button
        onClick={handleSync}
        disabled={loading}
        className="w-full bg-white/10 border border-white/20 text-white font-semibold py-2.5 rounded-lg hover:bg-white/15 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Sincronizando...
          </>
        ) : (
          'Sincronizar con Inmovilla'
        )}
      </button>
    </div>
  );
}
