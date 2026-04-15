'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { normalize } from '@/lib/utils';

interface Props {
  suggestions: string[];
  defaultValue?: string;
  placeholder?: string;
  name?: string;
  inputClassName?: string;
}

export default function LocationAutocomplete({
  suggestions,
  defaultValue = '',
  placeholder = 'Ciudad o zona',
  name = 'ciudad',
  inputClassName = '',
}: Props) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = value.length >= 1
    ? suggestions.filter((s) => normalize(s).includes(normalize(value)) && normalize(s) !== normalize(value))
    : [];

  // Cierra al hacer clic fuera
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const selectSuggestion = useCallback((suggestion: string) => {
    setValue(suggestion);
    setOpen(false);
    setActiveIndex(-1);
    // Foco de vuelta al input para que el usuario pueda enviar con Enter
    inputRef.current?.focus();
  }, []);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || filtered.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      selectSuggestion(filtered[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div ref={containerRef} className="relative flex-1">
      <input
        ref={inputRef}
        type="text"
        name={name}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open && filtered.length > 0}
        className={inputClassName}
        onChange={(e) => {
          setValue(e.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => {
          if (filtered.length > 0) setOpen(true);
        }}
        onKeyDown={onKeyDown}
      />

      {open && filtered.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden max-h-60 overflow-y-auto"
        >
          {filtered.map((suggestion, i) => {
            const q = normalize(value);
            const norm = normalize(suggestion);
            const start = norm.indexOf(q);
            const isActive = i === activeIndex;

            return (
              <li
                key={suggestion}
                role="option"
                aria-selected={isActive}
                onPointerDown={(e) => {
                  // Usamos pointerdown en vez de click para que se ejecute antes del blur
                  e.preventDefault();
                  selectSuggestion(suggestion);
                }}
                className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer text-sm transition-colors ${
                  isActive ? 'bg-[#faf8f3] text-[#0f1f3d]' : 'text-gray-700 hover:bg-[#faf8f3]'
                }`}
              >
                <span className="text-[#c9a84c] shrink-0">📍</span>
                {/* Resalta la parte que coincide */}
                {start >= 0 ? (
                  <span>
                    {suggestion.slice(0, start)}
                    <strong className="text-[#0f1f3d]">{suggestion.slice(start, start + value.length)}</strong>
                    {suggestion.slice(start + value.length)}
                  </span>
                ) : (
                  <span>{suggestion}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
