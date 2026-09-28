'use client';

import { useState, useRef, useEffect, useCallback, useId, useMemo } from 'react';
import { MapPin } from '@phosphor-icons/react';
import { normalize } from '@/lib/utils';
import { CATALAN_MUNICIPALITIES } from '@/data/catalanMunicipalities';

const MAX_RESULTS = 8;

// Pre-normalised once per module so typing doesn't re-normalise 947 names each keystroke
const DEFAULT_INDEX = CATALAN_MUNICIPALITIES.map((name) => ({ name, norm: normalize(name) }));

interface Props {
  /** Defaults to every municipality in Catalonia */
  suggestions?: readonly string[];
  defaultValue?: string;
  placeholder?: string;
  name?: string;
  id?: string;
  inputClassName?: string;
  onValueChange?: (value: string) => void;
  /** "top" opens the list upwards, for inputs that sit near the bottom of the viewport */
  placement?: 'bottom' | 'top';
}

export default function LocationAutocomplete({
  suggestions,
  defaultValue = '',
  placeholder = 'Ciudad o zona',
  name = 'ciudad',
  id,
  inputClassName = '',
  onValueChange,
  placement = 'bottom',
}: Props) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const index = useMemo(
    () => (suggestions ? suggestions.map((s) => ({ name: s, norm: normalize(s) })) : DEFAULT_INDEX),
    [suggestions]
  );

  // Names that start with the query first, then names containing it (e.g. "Perpètua" finds Santa Perpètua)
  const filtered = useMemo(() => {
    const q = normalize(value);
    if (!q) return [];
    const starts: string[] = [];
    const contains: string[] = [];
    for (const { name, norm } of index) {
      if (norm === q) continue;
      if (norm.startsWith(q) || norm.includes(` ${q}`)) starts.push(name);
      else if (norm.includes(q)) contains.push(name);
    }
    return [...starts, ...contains].slice(0, MAX_RESULTS);
  }, [value, index]);

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

  const updateValue = useCallback(
    (next: string) => {
      setValue(next);
      onValueChange?.(next);
    },
    [onValueChange]
  );

  const selectSuggestion = useCallback(
    (suggestion: string) => {
      updateValue(suggestion);
      setOpen(false);
      setActiveIndex(-1);
      // Foco de vuelta al input para que el usuario pueda enviar con Enter
      inputRef.current?.focus();
    },
    [updateValue]
  );

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

  const expanded = open && filtered.length > 0;

  return (
    <div ref={containerRef} className="relative flex-1">
      <input
        ref={inputRef}
        id={id}
        type="text"
        name={name}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-activedescendant={expanded && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
        className={inputClassName}
        onChange={(e) => {
          updateValue(e.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => {
          if (filtered.length > 0) setOpen(true);
        }}
        onKeyDown={onKeyDown}
      />

      {expanded && (
        <ul
          id={listId}
          role="listbox"
          className={`absolute left-0 right-0 z-50 ${placement === 'top' ? 'bottom-full mb-11' : 'top-full mt-2'} max-h-72 min-w-[240px] overflow-y-auto rounded-[var(--radius-input)] bg-white p-1.5`}
          style={{ boxShadow: 'var(--shadow-lift)' }}
        >
          {filtered.map((suggestion, i) => {
            const isActive = i === activeIndex;
            return (
              <li
                key={suggestion}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={isActive}
                onPointerDown={(e) => {
                  // pointerdown en vez de click para que se ejecute antes del blur
                  e.preventDefault();
                  selectSuggestion(suggestion);
                }}
                className={`flex cursor-pointer items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-[14px] text-[var(--dark)] transition-colors ${
                  isActive ? 'bg-[var(--rose-soft)]' : 'hover:bg-[var(--bg2)]'
                }`}
              >
                <MapPin size={16} weight="light" className="shrink-0 text-[var(--accent)]" />
                {suggestion}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
