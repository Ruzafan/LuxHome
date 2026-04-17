'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface UploadResult {
  created:     number;
  updated:     number;
  deactivated: number;
  errors:      string[];
}

export default function UploadForm() {
  const [file, setFile]       = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<UploadResult | null>(null);
  const [error, setError]     = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router   = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setResult(null);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    const res  = await fetch('/api/admin/upload', { method: 'POST', body: formData });
    const data = await res.json();

    if (res.ok) {
      setResult(data);
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
      router.refresh();
    } else {
      setError(data.error ?? 'Error al procesar el fichero');
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Drop zone */}
      <div
        className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-[#c9a84c]/50 transition cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xml,text/xml,application/xml"
          className="hidden"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            setResult(null);
            setError('');
          }}
        />
        <svg className="w-8 h-8 text-white/30 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        {file ? (
          <p className="text-[#c9a84c] text-sm font-medium">{file.name}</p>
        ) : (
          <>
            <p className="text-white/60 text-sm">Haz clic para seleccionar el fichero</p>
            <p className="text-white/30 text-xs mt-1">Fichero XML de Inmovilla ({'{numagencia}'}-web.xml)</p>
          </>
        )}
      </div>

      {/* Error de red o de formato */}
      {error && (
        <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
      )}

      {/* Resultado */}
      {result && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3 text-sm space-y-1">
          <p className="text-green-400 font-medium">Importación completada</p>
          <p className="text-white/60">Creados: <span className="text-white font-medium">{result.created}</span></p>
          <p className="text-white/60">Actualizados: <span className="text-white font-medium">{result.updated}</span></p>
          <p className="text-white/60">Desactivados: <span className="text-white font-medium">{result.deactivated}</span></p>
          {result.errors.length > 0 && (
            <p className="text-red-400">{result.errors.length} inmueble(s) con error</p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={!file || loading}
        className="w-full bg-[#c9a84c] text-[#0f1f3d] font-semibold py-2.5 rounded-lg hover:bg-[#b8943f] transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? 'Procesando...' : 'Subir e importar'}
      </button>
    </form>
  );
}
