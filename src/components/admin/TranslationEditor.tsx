'use client';

import { useState, useEffect, useCallback } from 'react';

type Locale = 'es' | 'ca' | 'en';

interface Translation {
  id: string;
  locale: string;
  key: string;
  value: string;
}

interface BaseMessages {
  [key: string]: unknown;
}

function flattenMessages(obj: BaseMessages, prefix = ''): Record<string, string> {
  return Object.entries(obj).reduce<Record<string, string>>((acc, [k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') {
      acc[path] = v;
    } else if (typeof v === 'object' && v !== null) {
      Object.assign(acc, flattenMessages(v as BaseMessages, path));
    }
    return acc;
  }, {});
}

const LOCALE_NAMES: Record<Locale, string> = { es: 'Español', ca: 'Català', en: 'English' };

export default function TranslationEditor() {
  const [locale, setLocale] = useState<Locale>('es');
  const [baseMessages, setBaseMessages] = useState<Record<string, string>>({});
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  const loadData = useCallback(async () => {
    const [messagesRes, overridesRes] = await Promise.all([
      fetch(`/api/admin/translations/base?locale=${locale}`),
      fetch(`/api/admin/translations?locale=${locale}`),
    ]);

    if (messagesRes.ok) {
      const data = await messagesRes.json();
      const flat = flattenMessages(data);
      setBaseMessages(flat);
      // Reset edit values to base
      setEditValues(flat);
    }
    if (overridesRes.ok) {
      const data: Translation[] = await overridesRes.json();
      const map: Record<string, string> = {};
      for (const t of data) map[t.key] = t.value;
      setOverrides(map);
      // Apply overrides to edit values
      setEditValues((prev) => ({ ...prev, ...map }));
    }
  }, [locale]);

  useEffect(() => { loadData(); }, [loadData]);

  async function save(key: string) {
    setSaving(key);
    const value = editValues[key] ?? baseMessages[key];
    await fetch('/api/admin/translations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale, key, value }),
    });
    setOverrides((prev) => ({ ...prev, [key]: value }));
    setSaving(null);
  }

  async function reset(key: string) {
    setSaving(key);
    await fetch('/api/admin/translations', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale, key }),
    });
    const { [key]: _, ...rest } = overrides;
    setOverrides(rest);
    setEditValues((prev) => ({ ...prev, [key]: baseMessages[key] }));
    setSaving(null);
  }

  const allKeys = Object.keys(baseMessages);
  const filtered = search
    ? allKeys.filter((k) => k.toLowerCase().includes(search.toLowerCase()) ||
        (editValues[k] ?? '').toLowerCase().includes(search.toLowerCase()))
    : allKeys;

  return (
    <section className="bg-white/5 border border-white/10 rounded-xl p-6">
      <h2 className="text-white font-semibold text-lg mb-1">
        Editor de traducciones
      </h2>
      <p className="text-white/50 text-sm mb-5">
        Modifica los textos de la web por idioma. Los cambios se aplican inmediatamente sin redesplegar.
      </p>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex gap-1 border border-white/20 rounded-lg overflow-hidden">
          {(['es', 'ca', 'en'] as Locale[]).map((loc) => (
            <button
              key={loc}
              onClick={() => setLocale(loc)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                locale === loc ? 'bg-[#c9a84c] text-[#0f1f3d]' : 'text-white/60 hover:text-white'
              }`}
            >
              {LOCALE_NAMES[loc]}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Buscar clave o texto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#c9a84c]"
        />
      </div>

      {/* Stats */}
      <p className="text-white/30 text-xs mb-4">
        {filtered.length} claves · {Object.keys(overrides).length} personalizadas
      </p>

      {/* Keys */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
        {filtered.map((key) => {
          const isOverridden = key in overrides;
          const current = editValues[key] ?? '';
          const base = baseMessages[key] ?? '';
          const changed = current !== (isOverridden ? overrides[key] : base);

          return (
            <div
              key={key}
              className={`rounded-lg border px-4 py-3 ${
                isOverridden ? 'border-[#c9a84c]/40 bg-[#c9a84c]/5' : 'border-white/10 bg-white/5'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <p className="text-[#c9a84c] text-xs font-mono">{key}</p>
                {isOverridden && (
                  <span className="text-xs text-amber-400 shrink-0">personalizado</span>
                )}
              </div>
              <textarea
                value={current}
                onChange={(e) => setEditValues((prev) => ({ ...prev, [key]: e.target.value }))}
                rows={current.length > 80 ? 3 : 1}
                className="w-full bg-white/10 border border-white/10 rounded px-3 py-2 text-white text-sm resize-y focus:outline-none focus:border-[#c9a84c] mb-2"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => save(key)}
                  disabled={saving === key || (!changed && !isOverridden)}
                  className="px-3 py-1 text-xs font-medium bg-[#c9a84c] text-[#0f1f3d] rounded hover:opacity-90 disabled:opacity-40 transition-opacity"
                >
                  {saving === key ? '...' : 'Guardar'}
                </button>
                {isOverridden && (
                  <button
                    onClick={() => reset(key)}
                    disabled={saving === key}
                    className="px-3 py-1 text-xs font-medium text-white/50 border border-white/20 rounded hover:text-white/80 disabled:opacity-40 transition-colors"
                  >
                    Restaurar original
                  </button>
                )}
                {isOverridden && (
                  <p className="text-white/30 text-xs ml-auto truncate max-w-xs" title={base}>
                    Original: {base}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
