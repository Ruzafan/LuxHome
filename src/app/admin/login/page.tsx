'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? 'Credenciales incorrectas');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1f3d] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Cabecera */}
        <div className="text-center mb-8">
          <p className="text-[#c9a84c] text-sm font-semibold tracking-[0.3em] uppercase mb-1">
            Panel de
          </p>
          <h1
            className="text-white font-bold text-3xl"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Administración
          </h1>
          <div className="w-12 h-0.5 bg-[#c9a84c] mx-auto mt-3" />
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-5"
        >
          <div>
            <label className="block text-white/70 text-sm mb-1.5">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#c9a84c] transition"
              placeholder="admin"
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-1.5">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#c9a84c] transition"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#c9a84c] text-[#0f1f3d] font-semibold py-2.5 rounded-lg hover:bg-[#b8943f] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-white/30 text-xs text-center mt-6">LuxHome · Acceso restringido</p>
      </div>
    </div>
  );
}
